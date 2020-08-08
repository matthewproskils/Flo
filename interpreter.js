function Function(original) {
    this.original = original;
    this.scope = [];
    //Adds args to the function scope:
    /*this.original.args.forEach(el => {
        this.scope.push(
            evaluator.evaluate(el, this.scope)
        );
    });*/

    this.call = caller => {
        var cArgAmm = this.original.args.length > caller.args.length || this.original.args.length < caller.args.length;
        if (this.original.args[this.original.args.length - 1][0] != "*" && cArgAmm) {
            console.log(`
               Error: at line ${caller.line}, ${caller.args.length} arguments given,
               ${this.original.args.length} required
            `)
        } else {
            if (this.original.fnEval) {
                this.original.fnEval(caller.args);
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
                // break; -- not required
            } else if (scope[i].name == name) {
                return scope[i];
                // break;
            }
        }
    }

    this.evaluate = (el, scope) => {
        //console.log("element: \n" + JSON.stringify(el, null, 2));
        if (el.type == "function") {
            //This is calling a function
            var containsFunc = this.scopeContainsName(el.value, scope) || this.scopeContainsName(el.value, this.globalScope);

            if (containsFunc) {
                containsFunc[0].call(el);
            } else {
                console.log(`The function ${el.name} at line ${el.line} does not exist`)
            }
        } else if (el.type == "variableDef") {
            let containsVar = this.scopeContainsName(el.value, scope) || this.scopeContainsName(el.value, this.globalScope);
            if (containsVar) {
				for(let i = 0; i < el.value.length; i++){
					if(el.value[i].type == 'variable'){
						el.value[i] == {type: 'string', value: evaluator.evaluate(el.value[i].value, this.globalScope)}
					}
				}
				for(let i=0; i < el.value.length; i++){
					el.value[i] = el.value[i].value
				}
                this.globalScope[containsVar] = { name: el.name, value: el.value};
            } else {
				for(let i = 0; i < el.value.length; i++){
					if(el.value[i].type == 'variable'){
						el.value[i] == {type: 'string', value: evaluator.evaluate(el.value[i].value, this.globalScope)}
					}
				}
				for(let i=0; i < el.value.length; i++){
					el.value[i] = el.value[i].value
				}
				this.globalScope.push({name: el.name, value: el.value.join("")})
	        }
        } else if (el.type == "functionDef") {
            console.log(`Defining a function named: "${el.name}"`);
            var contains = this.scopeContainsName(el.value, scope);

            if (contains) {
                scope[contains[1]] = new Function(el);
            } else {
                scope.push(new Function(el));
			}
        } else if (el.type == "variable") {
            let containsVar = this.scopeContainsName(el.value, scope) || this.scopeContainsName(el.value, this.globalScope);

            if (containsVar) {
                return containsVar;
            } else {
                console.log(`Error: The variable call at line ${el.line} is undefined`);
            }
        } else if(el.type == "string"){
			return el
		} else {
			console.log('error message?')
		}
    }

    this.process = tree => {
        tree.forEach(el => {
            this.evaluate(el, this.globalScope);
        });
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

        fnEval: args => {
			for(let i=0; i < args.length;i++){
				if(args[i].type == 'variable'){
                    args[i] = evaluator.evaluate(args[i], evaluator.globalScope).value
				}
			}
            
			args = args.filter(el => el.value != "" || el.value != void(0));
			let string = args.map(el => el.value || el)

            // @pavi2410: fixed; not sure why el.value is used
            
			console.log(string.toString())
        },
        args: ["*text"]
    })
)

evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "doMath",
        fnEval: args => {
            return eval(args[0].value);
        },
        args: ["math"]
    })
)

evaluator.globalScope.push(
    new Function({
        type: "functionDef",
        name: "roundFloat",
        fnEval: args => {
            return Number(`${args[0].value}`.split(".")[0])
        },
        args: ["float"]
    })
)

module.exports = { evaluator };