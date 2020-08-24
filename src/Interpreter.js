const builtins = require("./Builtins.js")
const Scope = require("./Scope.js")

function Unique(myArray) {
	return myArray.length === new Set(myArray).size;
}

function interpret(ast, scope) {
	if (ast === undefined) return
	if (ast.type === "Program") {
		//Check If Body Is Unefined
		if (ast.body[0] == null) {
			return
		} else {
			let globalScope = new Scope(builtins, null)
			return ast.body.map(k => interpret(k, globalScope))
		}
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
		let got = scope.get(name, scope);
		if (got == void (0)) {
			throw new Error(`${ast.name} is undefined`)
		}
		if (ast.other != []) {
			ast.other.forEach(el => {
				if (el[0] == ".") {
					if (typeof (got) != 'object' && !Array.isArray(got)) {
						throw new Error(`${got} is not an object`)
					}
					got = got[el[1].join('')]
				} else if (el[0] == '[') {
					console.log()
					if (!Array.isArray(got)) {
						throw new Error(`${got} is not an array`)
					}
					got = got[parseInt(el[1].join(''))]
				}
			})
		}
		return got
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

		if (containsFun) throw new Error(`Function ${name} is redeclared`)

		scope.set(name, funBody);

		return undefined
	}

	if (ast.type == 'ArrayExpr') {
		let returnarray = []
		ast.value.forEach(el => returnarray.push(interpret(el, scope)))
		return returnarray
	}

	if (ast.type === "Assignment") {
		let { id: { name }, expr } = ast

		const exprVal = interpret(expr, scope)

		let containsVar = scope.get(name);

		if (!containsVar) throw new Error(`Variable ${name} is not declared yet`)

		if (ast.other != []) {
			let joinedfull = []
			ast.id.other.forEach(el => {
				let joined = []
				el.forEach(al => {
					if (Array.isArray(al)) {
						joined.push(al.join(''))
					}
				})
				joinedfull.push(joined.join(''))
			})
			let x = scope.scope[name]
			scope.objset(name, joinedfull, exprVal)
		} else {
			scope.set(name, exprVal)
		}
		return undefined
	}

	if (ast.type === 'UnaryExpr') {
		const { argument, operator } = ast

		const val = interpret(argument, scope)

		switch (operator) {
			case '!':
				return !val
			case '-':
				return -val
			default:
				throw new Error(`unsupported unary operator ${operator}`)
		}
	}

	if (ast.type === 'BinaryExpr') {
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

	if (ast.type === 'ConditionalExpr') {
		const { alternate, consequent, test } = ast
		return interpret(test, scope) ? interpret(consequent, scope) : interpret(alternate, scope)
	}

	if (ast.type == 'Object') {
		let matches = []
		ast.value.forEach(el => matches.push(el[0].value))
		if (Unique(matches)) {
			let total = {}
			ast.value.forEach(el => {
				total[interpret(el[0])] = interpret(el[1])
			})
			return total
		} else {
			throw new Error(`Name Repeats Are Not Allowed In Object`)
		}
	}

	if (ast.type == 'loop') {
		let { start, end, skip: step, variable } = ast
		start = parseInt(start)
		end = parseInt(end)
		step = parseInt(step)

		for (let x = start; x <= end; x = x + skip) {
			let otherscope = new Scope({}, scope)
			otherscope.set(ast.variable.toString(), x)
			ast.code.forEach(el => { interpret(el, otherscope) })
		}
		return
	}

	if (ast.type == 'if') {
		if (eval(interpret(ast.check.one, scope) + ast.check.sign + interpret(ast.check.two, scope))) {
			ast.iftrue.forEach(el => interpret(el, scope))
		} else {
			ast.iffalse.forEach(el => interpret(el, scope))
		}
		return
	}

	if (ast.type == 'comment') {
		return
	}

	throw new Error(`unknown type: ${ast.type}`)
}

module.exports = interpret
