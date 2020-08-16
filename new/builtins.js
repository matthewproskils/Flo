const builtins = {
	"PI": 3.14,
  "print": {
    type: "function",
    call: args => {
      process.stdout.write(args.toString())
    }
  },
	"println": {
    type: "function",
    call: args => {
      process.stdout.write(args.toString() + '\n')
    }
  },
  "evalJS": {
    type: "function",
    call: args => {
      return eval(args);
    }
  },
  "typeOf": {
    type: "function",
    call: args => {
      return args[0].type;
    }
  },
  "roundFloat": {
    type: "function",
    call: args => {
      return Number(`${args[0]}`.split(".")[0])
    }
  }
}

module.exports = builtins