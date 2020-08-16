const builtins = require("./builtins.js")
const Scope = require("./Scope.js")

let globalScope = new Scope(builtins, null)

function interpret(ast, scope) {
  if (ast.type === "Program") {
    return ast.body.map(k => interpret(k, scope))
  }
  if (ast.type === "CallExpr") {
    const { id: callee, args } = ast

    const argVals = ast.args.map(arg => interpretExpr(arg, scope));
    const closureOrFunc = interpretExpr(callee, scope);
    switch (closureOrFunc.type) {
      case 'closure':
        // Don't know what it is \(>.<)/
        return applyClosure(interpretExpr, closureOrFunc, vals, env, Options.isLexical);

      case 'function':
        return closureOrFunc.call.apply(null, argVals);

      default:
        throw new Error(`The function ${callee.value} doesn't exist`)
    }

  } else if (ast.type === "VarDecl") {

    const {id: { value: name }, expr } = ast

    const exprVal = interpretExpr(expr, scope)

    let containsVar = scope.get(name);

    if (containsVar) throw new Error(`variable ${name} is redeclared`)

    scope.set(name, exprVal);

    return undefined;
  } else if (ast.type === "FunDecl") {
    
    let contains = scope.get(ast.name)

    scope.set(ast.name, ast);

    return undefined;
  } else if (ast.type === "Assignment") {
    const {id: { value: name }, expr} = ast

    const exprVal = interpretExpr(expr, scope)

    let containsVar = scope.get(name);

    if (!containsVar) throw new Error(`variable ${name} is not declared`)

    scope.set(name, exprVal)
    return undefined
  } else {
    throw new Error(`(Error:) token ${ast.value} has an undefined type (${ast.type}) is undefined`)
  }
}

module.exports = { interpret, globalScope };


////////////////////////

const statementInterp = (exp, env) => {
  switch (exp.type) {
    case 'Program': // yeah, this is hacky but it works
    case 'BlockStatement': {
      let currentEnv = env;

      for (let i = 0; i < exp.body.length; i++) {
        const currentExp = exp.body[i];

        switch (currentExp.type) {
          case 'ExpressionStatement': {
            interpretExpr(currentExp.expression, currentEnv); // stuff like `log(something)`
            continue;
          }

          case 'ReturnStatement': {
            const { argument } = currentExp;

            return interpretExpr(argument, currentEnv); // early return!
          }

          case 'VariableDeclaration': {
            const { kind, declarations } = currentExp;

            invariant(
              kind === 'const',
              `unsupported VariableDeclaration kind ${kind}`,
            );

            invariant(
              declarations.length === 1,
              `unsupported multiple (${declarations.length}) VariableDeclarations`,
            );

            const { id, init } = declarations[0];
            const { name } = id;

            if (init.type === 'ArrowFunctionExpression') {
              init.extra = { isLambda: true, name };
            }

            const val = interpretExpr(init, currentEnv);
            currentEnv = extendEnv(name, val, currentEnv);

            continue;
          }

          default: {
            throw new Error(`unsupported BlockStatement type ${currentExp.type}`);
          }
        }
      }

      return undefined; // `return` hasn't been called so we return `undefined`
    }

    default: {
      throw new Error(`unsupported statement type ${exp.type}`);
    }
  }
};


////////////////


const interpretExpr = (ast, scope) => {
  switch (ast.type) {
    case 'NullLiteral': {
      return null;
    }

    case 'StringLiteral':
    case 'NumberLiteral':
    case 'BooleanLiteral': {
      return ast.value;
    }

    case 'BlockStatement': {
      return statementInterp(ast, scope);
    }

    case 'Identifier': {
      const { value: name } = ast;

      return scope.get(name, scope);
    }

    case 'ArrowFunctionExpression': {
      const { body, params } = ast;
      const names = params.map((obj) => obj.name);

      if (ast.extra && ast.extra.isLambda) {
        const { name: selfId } = ast.extra;
        return makeRecClosure(selfId, names, body, scope);
      }

      return makeClosure(names, body, scope);
    }

    case 'CallExpression': {
      const { callee, arguments: rawArgs } = ast;
      // here we recur on both sides
      const vals = rawArgs.map((obj) => interpretExpr(obj, scope));
      const closureOrFunc = interpretExpr(callee, scope);

      switch (closureOrFunc.type) {
        case CLOSURE_TYPE_FLAG: {
          return applyClosure(interpretExpr, closureOrFunc, vals, scope, Options.isLexical);
        }
        case NATIVE_FUNC_FLAG: {
          return closureOrFunc.func.apply(null, vals);
        }
        default: {
          throw new Error(`unsupported ~closure type ${closureOrFunc.type}`);
        }
      }
    }

    case 'UnaryExpression': {
      const { argument, operator } = ast;

      switch (operator) {
        case '!': {
          return !interpretExpr(argument, scope);
        }
        case '-': {
          return -interpretExpr(argument, scope);
        }
        default: {
          throw new Error(`unsupported UnaryExpression operator ${operator}`);
        }
      }
    }

    case 'BinaryExpression': {
      const { left, operator, right } = ast;

      const leftVal = interpretExpr(left, scope)
      const rightVal = interpretExpr(right, scope)

      switch (operator) {
        case '+':
          return leftVal + rightVal;
        case '-':
          return leftVal - rightVal;
        case '*':
          return leftVal * rightVal;
        case '/':
          return leftVal / rightVal;
        case '==':
          return leftVal == rightVal;
        case '===':
          return leftVal === rightVal;
        case '!=':
          return leftVal != rightVal;
        case '!==':
          return leftVal !== rightVal;
        case '<':
          return leftVal < rightVal;
        case '<=':
          return leftVal <= rightVal;
        case '>':
          return leftVal > rightVal;
        case '>=':
          return leftVal >= rightVal;
        default:
          throw new Error(`unsupported binary operator ${operator}`);
      }
    }

    case 'ConditionalExpression': {
      const { alternate, consequent, test } = ast;
      return interpretExpr(test, scope) ? interpretExpr(consequent, scope) : interpretExpr(alternate, scope);
    }

    default:
      throw new Error(`unsupported expression type ${ast.type}`);
  }
};