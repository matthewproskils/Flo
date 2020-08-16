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
}

Program = body:StatementList { return { type: "Program", body } }

StatementList = head:Statement? tail:(_ Statement)* {
  return buildList(head, tail, 1)
}

Statement = VarDecl / FunDecl / FunCall / AssignmentExpr / EOS / Comment

VarDecl = "set" _ id:Identifier _ '=' _ expr:Expr EOS {
  return { type: 'VarDecl', id, expr }
}

FunDecl = "fun" _ id:Identifier _ '(' head:Identifier? tail:(_ ',' _ Identifier)* ')' _ '{' _ body:StatementList _ '}' {
  return { type: "FunDecl", id, params: buildList(head, tail, 3), body }
}

FunCall = id:Identifier '(' head:(Identifier / Expr)? tail:(_ ',' _ (Identifier / Expr))* ')' {
  return { type: 'FunCall', id, args: buildList(head, tail, 3) }
}

AssignmentExpr = id:Identifier _ '=' _ expr:Expr {
  return { type: 'Assignment', id, expr }
}

Expr = Literal / ArrayLiteral

BinOps = '+' / '-' / '*' / '/'

ArrayLiteral = '[' _ head:Literal? tail:(_ ',' _ Literal)* _ ']' {
  return { type: 'ArrayExpr', value: [].concat(optionalList(head), extractList(tail, 3)) }
}

Literal = Str / Bool / Number / Null

Str = (('"' [^"]* '"') / ("'" [^']* "'")) {
  return { type: 'StringLiteral', value: text().slice(1,-1) }
}

Bool = ("true" / "false") {
  return { type: 'BooleanLiteral', value: text() === 'true' }
}

Number = '-'? [0-9]+ ('.' [0-9]+)? {
  return { type: 'NumberLiteral', value: parseFloat(text().replace(/,/g, '')) }
}

Null = "null" {
  return { type: 'NullLiteral', value: null }
}

Identifier = head:[$_a-zA-Z] tail:[a-zA-Z0-9]* {
  return { type: 'Identifier', value: head + tail.join('') }
}

Comment "comment" = MultiLineComment / SingleLineComment

MultiLineComment = "/*" (!"*/" .)* "*/" {return {type: 'comment'}}

MultiLineCommentNoLineTerminator = "/*" (!("*/" / LineTerminator) .)* "*/"

SingleLineComment = "//" (!LineTerminator .)* {return {type: 'comment'}}

LineTerminator = '\n'

_ "whitespace" = [ \t\r\n]*

EOS = '\n'+ { return }