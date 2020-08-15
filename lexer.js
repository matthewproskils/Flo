function Lexer(input) {
    let tokens = [];

    this.parse = (arraypart, i) => {
        let part;
		arraypart = arraypart.trim()
        if (arraypart.match(/set\s*/)) {
            //set a variable
            if (arraypart.includes('=')) {
				if (arraypart.split('=').length == 1) {
					console.log(`(SyntaxError) 2 Variable Declaration Keywords Required, 1 given\n(When setting a variable, you need an equal sign (=) )`);
				} else {
					values = arraypart.match(/(set.*?=)(.*)/)[2].trim().split('+');
                    let realvalues = values.map(element => this.parse(element, i))
					part = {
						value: realvalues,
						name: arraypart.match(/( )[^=]+/)[0].trim(),
						type: 'variableDef'
					}
				}
			} else {
				console.log('(SyntaxError) When setting a variable, you need an equal sign (=)');
        	}
        } else if (arraypart.slice(0, 1) == "'" || arraypart.slice(0, 1) == '"') {
            //string
            var strVal = arraypart.match(/("|').*("|')/)[0];
            strVal = strVal.slice(1, strVal.length-1); //Remove quotes
            strVal = strVal.replace(/\${.*?}/g, el=> {
				return "${"+JSON.stringify(this.parse(el, i))+"}"
			});

            //Str commands:
            function strCmd (regEx, type) {
                strVal = strVal.replace(regEx, () => {
                    return type.repeat(parseInt(arguments[1].slice(1, -1)))
                });
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
                const op /* :string */ = arguments[1] // 'b' | 'o' | 'x' | 'u'
                const code /* :string */ = arguments[2]

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

 			part = {
                value: strVal,
                type: 'string'
      	    };           
        } else if (arraypart.match(/([^(]+)\(.*\)/) && !arraypart.match(/[^(]+(\()/)[0].includes(' ')) {
            //Check if it's a function
            if (arraypart[arraypart.length-1] != ')') {
                console.error(`(SyntaxError:) Expected ) at line ${i+1}`);
            } else {
                let argarray = [];
                let args = arraypart.match(/([^(]+)\((.*)\)/)[2]; //Raw arg
                if (args != "") {
                    args = args.trim();
                    args = args.split(',');
					args.forEach(el => {
						if(el != ""){
							argarray.push(this.parse(el, i));
						}
                    })
                }
                part = {
                    args: argarray,
                    type: "function",
                    name: arraypart.match(/([^(]+)\((.*)\)/)[1]
                };

			}
        }  else if (!isNaN(arraypart)) {
            part = {
                value: parseFloat(arraypart),
                type: "number"
            }
        } else if (arraypart.match(/fun\s*\w+\s*\(.*\)\s*\{[\s\S]*\}/)) {
            let regex = /fun\s*(\w+)\s*\((.*)\)\s*\{([\s\S]*)\}/
            let match = arraypart.match(regex)
			let codepieces = match[3].split('\n')
			let realcode = codepieces.filter(el => el.trim() !== "").map(el => this.parse(el, i))

            part = {
                type: "functionDef",
                name: match[1],
                args: match[2].split(","),
                code: realcode,
                params: match[2].split(","),
                body: realcode
            }
		} else if(arraypart.match(/-?\d+(\.\d+)?/)){
			part = {
				type: 'number',
				value: parseFloat(arraypart)
			}
		} else if(arraypart[0] == '[' && arraypart[arraypart.length-1] == ']'){
			let array = arraypart.slice(1, arraypart.length-1).split(',pls')
			array = array.map(el => {
				return this.parse(el, i)
			})
			part = {
				type: 'array',
				value: array
			}
		} else if(arraypart.match(/[\w\d]+/)){
			part = {
				type: "variable",
				name: arraypart.match(/[\w\d]+/)
			}
        } else {   
            console.log(`(SyntaxError) Unexpected token\n ${arraypart}\n at line ${i+1} 😢`)
        }
        if (part) {
            part.line = JSON.parse(JSON.stringify(i));
            return part;
        }
    }

    this.process = input => {
        //Splits Into Lines and removes ALL spaces
        
        //Remove multiline strings
        input = input.replace(/\/\*[\s\S]*?\*\//g, '')
        //Multi-line comments
		input = input.replace(/(\\\*)(.|\s)*(\*\\)/g, "")
        //Single-line comments
        input = input.replace(/\/\/.*/g, "");
        
        let array = input.split(/,pls,/g);

        //Remove blank indexes
        array = array.filter(el=> {
            return el.trim() != "";
        });

        if (array.length > 0) {
            array.forEach((el, i) => { 
                tokens.push(this.parse(el, i));
            });
        }   
        return tokens;
    }
}

module.exports = { Lexer };