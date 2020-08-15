function Function(original) {
    this.original = original;
    this.scope = [];

    this.call = caller => {
        this.scope = caller.args // test

        var cArgAmm = this.original.args.length > caller.args.length || this.original.args.length < caller.args.length;
        if (this.original.args[this.original.args.length - 1][0] != "*" && cArgAmm) {
            console.log(`
               (Error:) at line ${caller.line}, ${caller.args.length} arguments given,
               ${this.original.args.length} required
            `)
        } else {
            if (this.original.fnEval) {
                this.original.fnEval(caller.args, this.scope);
            } else {
                this.original.code.forEach(el => {
                    evaluator.evaluate(el, this.scope);
                });
            }
        }
    }
}

function Evaluator() {
    this.globalScope = [];

    this.scopeContainsName = (name, scope) => {
        for (var i = 0; i < scope.length; i++) {
            if (scope[i].original && scope[i].original.name == name) {
                return [scope[i], i];
            } else if (scope[i].name == name) {
                return [scope[i], i];
            }
        }
    }

    this.evaluate = (el, scope) => {
        if (el.type == "function") {
            //This is calling a function
            var containsFunc = this.scopeContainsName(el.name, scope) || this.scopeContainsName(el.name, this.globalScope);

            //console.log(":::", containsFunc)
            if (containsFunc) {
                containsFunc[0].call(el);
            } else {
                console.log(`(Error:) The function ${el.name} at line ${el.line} is undefined(doesn't exist)`)
            }
        } else if (el.type == "variableDef") {
            let containsVar = this.scopeContainsName(el.name, scope) || this.scopeContainsName(el.name, this.globalScope);

            if (containsVar) {
                if (this.globalScope.includes(containsVar[0])) {
                    this.globalScope[containsVar[1]].value = el.value[0].value;
                } else {
                    scope[containsVar[1]] = containsVar[0];
                }
            } else {
                scope.push({
                    name: el.name,
                    value: this.evaluate(el.value[0], scope)
                });
	        }
        } else if (el.type == "functionDef") {
            var contains = this.scopeContainsName(el.name, scope) || this.scopeContainsName(el.name, this.globalScope);

            if (contains) {
                this.globalScope[contains[1]] = new Function(el);
            } else {
                scope.push(new Function(el));
			}
        } else if (el.type == "variable") {
            let containsVar = this.scopeContainsName(el.name, scope) || this.scopeContainsName(el.name, this.globalScope);

            if (containsVar) {
                // console.log(containsVar[0])
                return containsVar[0].value;
            } else {
                console.log(`(Error:) The variable call at line ${el.line} is undefined`);
            }
        } else if(el.type == "string"){
			/*return el.value.replace(/\${.*?}/g, el=> {
				
				
            })*/
            return el.value;
		} else if(el.type == 'array'){
			let array;
			array = el.value.map(el => {return this.evaluate(el)})
		} else {
			console.log(" ".repeat(el.length) + el.value)
			console.log('(Error:) token (^) type is undefined')
		}
    }
}

let evaluator = new Evaluator();

/*___________________________________
|       In-built Functions          |
|___________________________________|
*/

//EVAL is only for in-built functions
evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "print",
        fnEval: (args, scope) => {
			/*for(let i=0; i < args.length; i++){
				if(args[i].type == 'variable'){
                    args[i] = evaluator.evaluate(args[i], evaluator.globalScope).value
				}
			}
			
            args = args.filter(el => el.value != "" || el.value);
            args = args.map(arg=> arg.value);
        
			console.log(args.join(""));*/
            for (var i=0; i<args.length; i++) {
                console.log(args[i]);
                console.log(scope);
                console.log(evaluator.evaluate(args[i], scope));
            }
			/*let stringarray = []
            for (var i=0; i<args.length; i++) {
                stringarray.push(args[i].value);
            }*/
			//console.log(stringarray.join(""))
        },
        args: ["*text"]
    })
)

evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "doMath",
        fnEval: (args, scope) => {
            console.log(eval(args[0].value));
        },
        args: ["math"]
    })
)

evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "typeOf",
        fnEval: (args, scope) => {
            return args[0].type;
        },
        args: ["math"]
    })
)

evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "roundFloat",
        fnEval: (args, scope) => {
            console.log(Number(`${args[0].value}`.split(".")[0]))
        },
        args: ["float"]
    })
)

module.exports = { evaluator };