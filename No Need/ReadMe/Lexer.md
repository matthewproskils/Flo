# How To Use Lexered Tokens
##### Example Function Token
```json
{ namw: 'print', type: 'function', args: [ {value: "hello", type: "string"} ] }
```
##### Get Arguments:
```
var lineNumber = 0;
console.log(lexed[lineNumber].args)
```
--------------------
##### Example Declaration Token
```
{ value: 'x', type: 'variable' }
```
##### Get Using:
```
var lineNumber = 0;
lexed[lineNumber];
```
--------------------
##### Example Math Token
```
[{"value": 34,"type": "number"}]
```
##### Example Function Declaration
```
{
  type: 'FunctionDef',
  name: 'test',
  args: 'test',
  body: see below
}
```
##### Example Function Declaration Code
```
{value: [ { value: '"Everything"', type: 'string' } ],name: 'anotherBug',type: 'VariableDef'
}
```
##### NOTES
**USE TYPE TO GET TYPE**