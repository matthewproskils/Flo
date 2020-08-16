/*___________________________________
|       In-built Functions          |
|___________________________________|
*/

const { interpret } = require('./Interpreter')

const builtins = {
  "print": {
    type: "function",
    name: "print",
    call: args => {
      console.log(args)
    },
    args: ["*text"]
  },
  "doMath": {
    type: "function",
    name: "doMath",
    call: args => {
      return eval(args);
    },
    args: ["math"]
  },
  "typeOf": {
    type: "function",
    name: "typeOf",
    call: args => {
      return args[0].type;
    },
    args: ["math"]
  },
  "roundFloat": {
    type: "function",
    name: "roundFloat",
    call: args => {
      console.log(Number(`${args[0].value}`.split(".")[0]))
    },
    args: ["float"]
  }
}

module.exports = builtins