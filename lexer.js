function Lexer(input) {
    let tokens = [];

    this.parse = (arraypart, i) => {
        let part;
		arraypart = arraypart.trim()
        if (arraypart.match(/(set)(\ )/)) {
            //set a variable
            if (arraypart.includes('=')) {
				if (arraypart.split('=').length == 1) {
					console.log(`(SyntaxError) 2 Variable Declaration Keywords Required, 1 given\n(When setting a variable, you need an equal sign (=) )`);
				} else {
					values = arraypart.match(/(set.*=)(.*)/)[2].trim().split('+')
					let realvalues = []
					values.forEach(element => realvalues.push(this.parse(element, i)))
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
            //var srtVal = arraypart.match(/("|').*("|')/)[0].slice(1, arraypart.match(/("|').*("|')/)[0].length-1).replace(/\\n(\(.*\))/g, "\n");
            var strVal = arraypart.match(/("|').*("|')/)[0];
            strVal = strVal.slice(1, arraypart.match(/("|').*("|')/)[0].length-1);
            
            strVal = strVal.split(/\\n(\(.*\))/g);
            console.log(strVal);
            strVal.forEach((el, i)=> {
                var newLnNum = el.match(/\((\d*)\)/);
                if (newLnNum) {
                    console.log(newLnNum);
                    for (var i=0; i<newLnNum; i++) {
                        el+="\n";
                    }
                }
                strVal[i] = JSON.parse(JSON.stringify(el));
            });

 			part = {
                value: strVal.join(""),
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
							console.log(this.parse(el, i))
						}
                    })
                }
                part = {
                    args: argarray,
                    type: "function",
                    value: arraypart.match(/([^(]+)\((.*)\)/)[1]
                };

			}
        }  else if (!isNaN(arraypart)) {
            part = {
                value: parseFloat(arraypart),
                type: "number"
            }
        } else if (arraypart.match(/^func\s*(\w+)\s*takes\s*args\s*\((.*)\)\s*\{.*\}/)) {
            let regex = /^func\s*(\w+)\s*takes\s*args\s*\((.*)\)\s*\{(.*)\}/
			let codepieces = arraypart.match(regex)[3].split('N=>L')
			let realcode = []
			codepieces.forEach(element => element.trim()!=""?realcode.push(this.parse(element, i)):console.log())
            part = {
                type: "functionDef",

                name: arraypart.match(regex)[1],
                args: arraypart.match(regex)[2].split(","),
                code: realcode
            }
		} else if(arraypart.match(/([\w\d]+)/)){
			part = {
				type: "variable",
				value: arraypart.match(/([\w\d]+)/)[0]
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

        input = input.replace(/\/\*[\s\S]*\*\//g, '')

        let array = input.split(/\n|,please/g);

        //Remove comments:
        array = array.filter(el=> { 
            return el.trim().slice(0, 2) != "//";
            // this is not a EOL comment!
            // is this intended?
        });

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