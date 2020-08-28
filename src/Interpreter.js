const builtins = require("./Builtins.js")
const Scope = require("./Scope.js")

function Unique(myArray) {
	return myArray.length === new Set(myArray).size;
}

function interpret(ast, scope) {
	if (ast === undefined) return

	if (ast.type === "Program") {
		//Check If Body Is Unefined
		if (ast.body[0] == null) return

		let globalScope = new Scope(builtins, null)
		return ast.body.map(k => interpret(k, globalScope))
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
				return closureOrFunc.run.apply(null, argVals);

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
			type: 'function', name, run: (...args) => {

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
		return ast.value.map(el => interpret(el, scope))
	}

	if (ast.type === "Assignment") {
		let { id: { name }, expr } = ast

		const exprVal = interpret(expr, scope)

		let containsVar = scope.get(name);

		if (!containsVar) throw new Error(`Variable ${name} is not declared yet`)
		if (ast.id.other.length > 0) {
			let joinedfull = ast.id.other.map(el => el.filter(Array.isArray).map(al => al.join('')).join(''))
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
		const { left, op, right } = ast;

		const leftVal = interpret(left, scope)
		const rightVal = interpret(right, scope)

		switch (op) {
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
				throw new Error(`unsupported binary operator ${op}`)
		}
	}

	if (ast.type === 'ConditionalExpr') {
		const { alternate, consequent, test } = ast
		return interpret(test, scope) ? interpret(consequent, scope) : interpret(alternate, scope)
	}
	
	if (ast.type == 'IfStmt') {
	// Merge with ConditionalExpr!!
		return (eval(interpret(ast.check.one, scope) + ast.check.sign + interpret(ast.check.two, scope)))
			? ast.iftrue.map(el => interpret(el, scope))
			: ast.iffalse.map(el => interpret(el, scope))
	}

	if (ast.type == 'ObjectLiteral') {
		//clean up!!
		let matches = []
		ast.value.forEach(el => matches.push(el[0].value))
		if (Unique(matches)) {
			let total = {}
			ast.value.forEach(el => {
				total[interpret(el[0])] = interpret(el[1])
			})
			return total
		}
		throw new Error(`Name Repeats Are Not Allowed In Object`)
	}

	if (ast.type == 'LoopStmt') {
		let { start, end, step, variable, body} = ast

		start = parseInt(interpret(start, scope))
		end = parseInt(interpret(end, scope))
		step = parseInt(interpret(step, scope))
		if(variable.name  in scope.scope){
			throw new Error(`Cannot use declared (${variable.name}) variable in loop`)
		}
		for (let x = start; x <= end; x = x + step) {
			scope.set(variable.name, x)
			ast.body.forEach(el => {interpret(el, scope)})
			delete scope.scope[variable.name]
		}
		return
	}

	if (ast.type == 'comment') {
		return
	}
	if(ast.type == 'ThrowLiteral'){
		console.log(interpret(ast.value[1], scope))
		return
	}
	throw new Error(`unknown type: ${ast.type}`)
}

module.exports = interpret
