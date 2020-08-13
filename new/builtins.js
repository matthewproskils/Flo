/*___________________________________
|       In-built Functions          |
|___________________________________|
*/

const builtins = [
    {
        type: "function",
        name: "print",
        call: (args, scope) => {
            args
                .map(arg => evaluator.evaluate(arg, scope))
                .forEach(console.log)
        },
        args: ["*text"]
    }, {
        type: "function",
        name: "doMath",
        call: (args, scope) => {
            console.log(eval(args[0].value));
        },
        args: ["math"]
    }, {
        type: "function",
        name: "typeOf",
        call: (args, scope) => {
            return args[0].type;
        },
        args: ["math"]
    }, {
        type: "function",
        name: "roundFloat",
        call: (args, scope) => {
            console.log(Number(`${args[0].value}`.split(".")[0]))
        },
        args: ["float"]
    }
]

module.exports = builtins