{
  const filledArray = (count, value) => Array.apply(null, new Array(count)).map(() => value)

  const extractOpt = (opt, index) => opt ? opt[index] : null

  const optList = value => value !== null ? value : []

  const extractList = (list, index) => list.map(el => el[index])

  const buildList = (head, tail, index) => [head].concat(extractList(tail, index))

  const buildBinaryExpr = (head, tail) => tail.reduce((result, el) => ({ type: "BinaryExpr", operator: el[1], left: result, right: el[3] }), head)

	function escapeString(str) {
		function strCmd(regex, type) {
			str = str.replace(regex, (_, g1 = '(1)') => type.repeat(parseInt(g1.slice(1, -1))))
		}

		strCmd(/\\n(\(\S+\))?/g, "\n");
		strCmd(/\\t(\(\S+\))?/g, "\t");
		strCmd(/\\s(\(\S+\))?/g, " ");
		
		const opMap = { 'b': 2, 'o': 8, 'x': 16 }
		str = str.replace(/\\([box])\((\S+)\)/g, (_, op, code) => String.fromCharCode(parseInt(code, opMap[op])))

		return str
	}
}

/////////////////////////////////// GRAMMAR ///////////////////////////////////

Program = body:StatementList {
	return { type: "Program", body }
}

StatementList = head:Statement* {
  return head
}

Statement = ThrowLiteral / IfStmt / LoopStmt / VarDecl / FunDecl / Expr / AssignmentExpr / Comment EOS

ThrowLiteral = all:(_ (Literal/Identifier) _){
	return {type: "ThrowLiteral", value: all }
}

IfStmt = IF_TOKEN _ ':' _ one:(Expr / Identifier) _ sign:('==' / '!=' / '&&' / '>' / '<' / '>=' / '<=') _ two:(Expr / Identifier) _ '{' _ iftrue:StatementList _ '}' _ ELSE_TOKEN _ '{' _ iffalse:StatementList _ '}' EOS {
	return { type: 'IfStmt', check: {one, sign, two}, iftrue, iffalse }
}

LoopStmt = LOOP_TOKEN _ start:(Number / Identifier) _ '<' _ variable:Identifier _ '<' _ end:(Number / Identifier) _ '^'_ step:(Number / Identifier) _ '{' _ body:StatementList _ '}' EOS {
	return { type: 'LoopStmt', start, end, variable, step, body }
}

VarDecl = VAR_TOKEN _ id:Identifier _ '=' _ expr:Expr EOS {
  return { type: 'VarDecl', id, expr }
}

FunDecl = FUN_TOKEN _ id:Identifier _ '(' head:Identifier? tail:(_ ',' _ Identifier)* ')' _ '{' _ body:StatementList _ '}' {
  return { type: "FunDecl", id, params: [].concat(optList(head), extractList(tail, 3)), body }
}

CallExpr = id:Identifier '(' head:(Expr / Identifier)? tail:(_ ',' _ (Expr / Identifier))* ')' {
  return { type: 'CallExpr', id, args: [].concat(optList(head), extractList(tail, 3)) }
}

AssignmentExpr = id:Identifier _ '=' _ expr:Expr {
  return { type: 'Assignment', id, expr }
}

Expr =  BinaryExpr / Literal / ArrayLiteral / CallExpr / ObjectLiteral

BinaryExpr = left:(Literal / Identifier) _ op:BIN_OPS _ right:(Literal / Identifier / BinaryExpr) {
  return { type: 'BinaryExpr', left, op, right }
}

ArrayLiteral = '[' _ head:Expr? tail:(_ ',' _ Expr)* _ ']' {
  return { type: 'ArrayExpr', value: [].concat(optList(head), extractList(tail, 3)) }
}

// clean up!!
ObjectLiteral = all:('{' _ (_ Str _ ':' _ Expr _)? _ (_ ',' _ Str _ ':' _ Expr _)* _ '}') {
	let returnarray = [];
	for(let i=1; i<(all.length+1)/2; i++){
		returnarray.push(all[i*2])
	};
	if(returnarray[0]){
		returnarray[0] = [returnarray[0][1], returnarray[0][5]]
	}
	for(let i=0; i<returnarray[1].length;i++){
		returnarray[1][i] = [returnarray[1][i][3], returnarray[1][i][7]]
	}
	let returnarray2 = [returnarray[0]];
	returnarray[1].forEach(el => returnarray2.push(el));
	let returnarray3 = {type: 'ObjectLiteral', value: returnarray2};
	return returnarray3
}

Literal = Str / Bool / Number / Null

Str = (('"' [^"]* '"') / ("'" [^']* "'")) {
  return { type: 'StringLiteral', value: escapeString(text().slice(1,-1)) }
}

Bool = BOOL_TOKEN {
  return { type: 'BooleanLiteral', value: text() === 'true' }
}

Number = '-'? [0-9]+ ('.' [0-9]+)? {
  return { type: 'NumberLiteral', value: parseFloat(text().replace(/,/g, '')) }
}

Null = NULL_TOKEN {
  return { type: 'NullLiteral' }
}

Identifier = head:[$_a-zA-Z] tail:[a-zA-Z0-9]*  other: (('[' [0-9]+ ']') / ('.' [a-zA-Z0-9]+))*{
    return { type: 'Identifier', name: head + tail.join(''), other }
}

Comment "comment" = MultiLineComment / SingleLineComment

MultiLineComment = "/*" (!"*/" .)* "*/" {
	return { type: 'comment' }
}

SingleLineComment = "//" (!EOS .)* {
	return { type: 'comment' }
}

_ "whitespace" = [ \t\n\r]*
EOS = [\n]
EOF = !.

IF_TOKEN = 'if' / 'ask'
ELSE_TOKEN = 'else'
LOOP_TOKEN = 'loop'
VAR_TOKEN = 'set'
FUN_TOKEN = 'fun'
BOOL_TOKEN = 'true' / 'false'
NULL_TOKEN = 'null'

BIN_OPS = [+-/*]
