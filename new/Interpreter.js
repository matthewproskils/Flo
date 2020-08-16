const builtins = require("./builtins.js")
const Scope = require("./Scope.js")

let globalScope = new Scope(builtins, null)

function interpret(ast, scope) {
	if (ast.type === "Program") {
		return ast.body.map(k => interpret(k, scope))
	}

	if (ast.type === 'NullLiteral') {
		return null;
	}

	if (ast.type === 'StringLiteral'
		|| ast.type === 'NumberLiteral'
		|| ast.type === 'BooleanLiteral') {
		return ast.value;
	}

	if (ast.type === 'Identifier') {
		const { name } = ast;

		return scope.get(name, scope);
	}

	if (ast.type === "CallExpr") {
		const { id: callee, args } = ast

		const argVals = ast.args.map(arg => interpret(arg, scope))

		const closureOrFunc = interpret(callee, scope);

		switch (closureOrFunc.type) {
			case 'function':
				return closureOrFunc.call.apply(null, argVals);

			default:
				throw new Error(`The function ${callee.value} doesn't exist`)
		}
	}

	if (ast.type === "VarDecl") {
		const { id: { name }, expr } = ast

		const exprVal = interpret(expr, scope)

		let containsVar = scope.get(name)

		if (containsVar) throw new Error(`variable ${name} is redeclared`)

		scope.set(name, exprVal);

		return undefined;
	}

	if (ast.type === "FunDecl") {
		const { id: { name }, params, body } = ast

		const funBody = {
			type: 'function', name, call: (...args) => {

				const funScope = new Scope({}, scope)

				params.forEach((param, i) => {
					funScope.set(param.name, args[i])
				})

				return body.map(b => interpret(b, funScope))
			}
		}

		let containsFun = scope.get(name);

		if (containsFun) throw new Error(`variable ${name} is redeclared`)

		scope.set(name, funBody);

		return undefined
	}

	if (ast.type === "Assignment") {
		const { id: { name }, expr } = ast

		const exprVal = interpret(expr, scope)

		let containsVar = scope.get(name);

		if (!containsVar) throw new Error(`variable ${name} is not declared`)

		scope.set(name, exprVal)

		return undefined
	}

	if (ast.type === 'UnaryExpression') {
		const { argument, operator } = ast

		const val = interpret(argument, scope)

		switch (operator) {
			case '!':
				return !val
			case '-':
				return -val
			default:
				throw new Error(`unsupported UnaryExpression operator ${operator}`)
		}
	}

	if (ast.type === 'BinaryExpression') {
		const { left, operator, right } = ast;

		const leftVal = interpret(left, scope)
		const rightVal = interpret(right, scope)

		switch (operator) {
			case '+':
				return leftVal + rightVal
			case '-':
				return leftVal - rightVal
			case '*':
				return leftVal * rightVal
			case '/':
				return leftVal / rightVal
			case '==':
				return leftVal == rightVal
			case '===':
				return leftVal === rightVal
			case '!=':
				return leftVal != rightVal
			case '!==':
				return leftVal !== rightVal
			case '<':
				return leftVal < rightVal
			case '<=':
				return leftVal <= rightVal
			case '>':
				return leftVal > rightVal
			case '>=':
				return leftVal >= rightVal
			default:
				throw new Error(`unsupported binary operator ${operator}`)
		}
	}

	if (ast.type === 'ConditionalExpression') {
		const { alternate, consequent, test } = ast
		return interpret(test, scope) ? interpret(consequent, scope) : interpret(alternate, scope)
	}


	throw new Error(`unknown type: ${ast.type}`)
}

module.exports = { interpret, globalScope }