const builtins = require("./builtins.js")
const Scope = require("./Scope.js")

let globalScope = new Scope(builtins, null)

function interpret(el, scope) {
    if (el instanceof Array) {
        return el.map(k => interpret(k, scope))
    }

    if (el.type === "function") {
        //This is calling a function
        console.log(scope, el.name, scope.get(el.name))
        let containsFunc = scope.get(el.name);

        if (!containsFunc) {
            throw new Error(`The function ${el.name} at line ${el.line} doesn't exsist`)
        }
        

        let funScope = new Scope({}, scope)

        // el.args.map(arg => )
        

        return interpret(containsFunc.body, funScope);
    } else if (el.type === "variableDef") {
        let containsVar = scope.get(el.name);

        scope.set(el.name, interpret(el.value[0], scope));

        return undefined;
    } else if (el.type === "functionDef") {
        let contains = scope.get(el.name)

        scope.set(el.name, el);

        return undefined;
    } else if (el.type === "variable") {
        let containsVar = scope.get(el.name);

        if (!containsVar) {
            throw new Error(`(Error:) The variable call at line ${el.line} is undefined`);
        }

        return containsVar[0].value;
    } else if (el.type === "string" || el.type === 'number' || el.type == 'array') {
        return el.value;
    } else {
        console.log(`(Error:) token ${el.value} has an undefined type (${el.type}) is undefined`)
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
            expInterp(currentExp.expression, currentEnv); // stuff like `log(something)`
            continue;
          }

          case 'ReturnStatement': {
            const { argument } = currentExp;

            return expInterp(argument, currentEnv); // early return!
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

            const val = expInterp(init, currentEnv);
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


const expInterp = (exp, env) => {
  switch (exp.type) {
    case 'NullLiteral': {
      return null;
    }

    case 'NumericLiteral':
    case 'BooleanLiteral': {
      return exp.value;
    }

    case 'BlockStatement': {
      return statementInterp(exp, env);
    }

    case 'Identifier': {
      const { name } = exp;

      if (Object.keys(Prims).includes(name)) {
        return Prims[name];
      }

      return lookupEnv(name, env);
    }

    case 'ArrowFunctionExpression': {
      const { body, params } = exp;
      const names = params.map((obj) => obj.name);

      if (exp.extra && exp.extra.isLambda) {
        const { name: selfId } = exp.extra;
        return makeRecClosure(selfId, names, body, env);
      }

      return makeClosure(names, body, env);
    }

    case 'CallExpression': {
      const { callee, arguments: rawArgs } = exp;
      // here we recur on both sides
      const vals = rawArgs.map((obj) => expInterp(obj, env));
      const closureOrFunc = expInterp(callee, env);

      switch (closureOrFunc.type) {
        case CLOSURE_TYPE_FLAG: {
          return applyClosure(expInterp, closureOrFunc, vals, env, Options.isLexical);
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
      const { argument, operator } = exp;

      switch (operator) {
        case '!': {
          return !expInterp(argument, env);
        }
        case '-': {
          return -expInterp(argument, env);
        }
        default: {
          throw new Error(`unsupported UnaryExpression operator ${operator}`);
        }
      }
    }

    case 'BinaryExpression': {
      const { left, operator, right } = exp;
      switch (operator) {
        case '+': {
          return expInterp(left, env) + expInterp(right, env);
        }
        case '-': {
          return expInterp(left, env) - expInterp(right, env);
        }
        case '*': {
          return expInterp(left, env) * expInterp(right, env);
        }
        case '/': {
          return expInterp(left, env) / expInterp(right, env);
        }
        case '==': {
          return expInterp(left, env) == expInterp(right, env); // eslint-disable-line eqeqeq
        }
        case '===': {
          return expInterp(left, env) === expInterp(right, env);
        }
        case '!=': {
          return expInterp(left, env) != expInterp(right, env); // eslint-disable-line eqeqeq
        }
        case '!==': {
          return expInterp(left, env) !== expInterp(right, env);
        }
        case '<': {
          return expInterp(left, env) < expInterp(right, env); // eslint-disable-line eqeqeq
        }
        case '<=': {
          return expInterp(left, env) <= expInterp(right, env);
        }
        case '>': {
          return expInterp(left, env) > expInterp(right, env); // eslint-disable-line eqeqeq
        }
        case '>=': {
          return expInterp(left, env) >= expInterp(right, env);
        }
        default: {
          throw new Error(`unsupported BinaryExpression operator ${operator}`);
        }
      }
    }

    case 'ConditionalExpression': {
      const { alternate, consequent, test } = exp;
      return expInterp(test, env) ? expInterp(consequent, env) : expInterp(alternate, env);
    }

    default: {
      throw new Error(`unsupported expression type ${exp.type}`);
    }
  }
};
