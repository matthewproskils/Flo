{
  function filledArray(count, value) {
    return Array.apply(null, new Array(count)).map(() => value);
  }

  function extractOptional(optional, index) {
    return optional ? optional[index] : null;
  }

  function extractList(list, index) {
    return list.map(el => el[index]);
  }

  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
  }

  function buildBinaryExpression(head, tail) {
    return tail.reduce(function(result, element) {
      return {
        type: "BinaryExpr",
        operator: element[1],
        left: result,
        right: element[3]
      };
    }, head);
  }

  function optionalList(value) {
    return value !== null ? value : [];
  }

	/////////////////////

	function escapeString(strVal) {
		function strCmd (regEx, type) {
			strVal = strVal.replace(regEx, function () {
				return type.repeat(parseInt((arguments[1] || '(1)').slice(1, -1)))
			})
		}

		strCmd(/\\n(\(\S+\))?/g, "\n");
		strCmd(/\\t(\(\S+\))?/g, "\t");
		strCmd(/\\s(\(\S+\))?/g, " ");

		// support escapes
		// b = binary
		// o = octal
		// x = hexadecimal
		// u = unicode
		strVal = strVal.replace(/\\([boxu])\((\S+)\)/g, function () {
				const op = arguments[1] // 'b' | 'o' | 'x' | 'u'
				const code = arguments[2]

				if (op === 'b') {
						return String.fromCharCode(parseInt(code, 2))
				} else if (op === 'o') {
						return String.fromCharCode(parseInt(code, 8))
				} else if (op === 'x') {
						return String.fromCharCode(parseInt(code, 16))
				} else if (op === 'u') {
						throw new Error('not implemented')
				}
		})

		return strVal
	}

	//////////////////////////////
}

Program = body:StatementList { return { type: "Program", body } }

StatementList = head:Statement? tail:(_ Statement)* {
  return buildList(head, tail, 1)
}

Statement = If / VarDecl / FunDecl / CallExpr / AssignmentExpr / EOS / Comment / Loop

If = ('ask' / 'if') _ ':' _ one:(Expr / Identifier) _ sign:('==' / '!=' / '&&' / '>' / '<' / '>=' / '<=') _ two:(Expr / Identifier) _ '{' _ iftrue:(Statement*) _ '}' _ 'else' _ '{' _ iffalse:(Statement*) _ '}'{
	return {type: 'if', check: {one: one, sign: sign, two: two}, iftrue: iftrue, iffalse: iffalse}
}


Loop = 'loop' _ start:([0-9]+) _ '>' _ variable:([a-zA-Z]+) _ '>' _ end:([0-9]+) _ '>'_ times:([1-9] [0-9]*) _ '{' _ code:(Statement _)* _ '}' _ {
	return {type: 'loop', start: start.join(''), end: end.join(''), variable: variable.join(''), skip: times.join(''), code: code.map(el => {return el[0]})}
}
VarDecl = "set" _ id:Identifier _ '=' _ expr:Expr EOS {
  return { type: 'VarDecl', id, expr}
}

FunDecl = "fun" _ id:Identifier _ '(' head:Identifier? tail:(_ ',' _ Identifier)* ')' _ '{' _ body:StatementList _ '}' {
  return { type: "FunDecl", id, params: [].concat(optionalList(head), extractList(tail, 3)), body }
}

CallExpr = id:Identifier '(' head:(Identifier / Expr)? tail:(_ ',' _ (Identifier / Expr))* ')' {
  return { type: 'CallExpr', id, args: [].concat(optionalList(head), extractList(tail, 3)) }
}

AssignmentExpr = id:Identifier _ '=' _ expr:Expr {
  return { type: 'Assignment', id, expr }
}

Expr = Literal / ArrayLiteral / CallExpr / ObjectLiteral

BinOps = [+-/*]*

ArrayLiteral = '[' _ head:Expr? tail:(_ ',' _ Expr)* _ ']' {
  return { type: 'ArrayExpr', value: [].concat(optionalList(head), extractList(tail, 3)) }
}

ObjectLiteral = all:('{' _ (_ Str _ ':' _ Expr _)? _ (_ ',' _ Str _ ':' _ Expr _)* _ '}') {let returnarray = []; for(let i=1; i<(all.length+1)/2; i++){returnarray.push(all[i*2])}; if(returnarray[0]){returnarray[0] = [returnarray[0][1], returnarray[0][5]]}; for(let i=0; i<returnarray[1].length;i++){returnarray[1][i] = [returnarray[1][i][3], returnarray[1][i][7]]}let returnarray2 = [returnarray[0]]; returnarray[1].forEach(el => returnarray2.push(el));let returnarray3 = {type: 'Object', value: returnarray2}; return returnarray3}

Literal = Str / Bool / Number / Null

Str = (('"' [^"]* '"') / ("'" [^']* "'")) {
  return { type: 'StringLiteral', value: escapeString(text().slice(1,-1)) }
}

Bool = ("true" / "false") {
  return { type: 'BooleanLiteral', value: text() === 'true' }
}

Number = '-'? [0-9]+ ('.' [0-9]+)? {
  return { type: 'NumberLiteral', value: parseFloat(text().replace(/,/g, '')) }
}

Null = "null" {
  return { type: 'NullLiteral' }
}

Identifier = head:[$_a-zA-Z] tail:[a-zA-Z0-9]*  other: (('[' [0-9]+ ']') / ('.' [a-zA-Z0-9]+))*{
    return { type: 'Identifier', name: head + tail.join(''), other: other}
}

Comment "comment" = MultiLineComment / SingleLineComment / Newline

MultiLineComment = "/*" (!"*/" .)* "*/" {return {type: 'comment'}}

Newline = "\n" {return {type: 'comment'}}
MultiLineCommentNoLineTerminator = "/*" (!("*/" / LineTerminator) .)* "*/"

SingleLineComment = "//" (!LineTerminator .)* {return {type: 'comment'}}

LineTerminator = [\n]+

_ "whitespace" = space*

space = [ \t\n\r]+

EOS = '\n'+ { return }

EOF = !.