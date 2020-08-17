const builtins = {
	"PI": 3.14,
  "print": {
    type: "function",
    call: args => {
    	process.stdout.write(toFateString(args))
    }
  },
	"println": {
    type: "function",
    call: args => {
    	process.stdout.write(toFateString(args) + '\n')
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


function toFateString(val) {
	if (val === null) {
		return "null"
	}
	if (typeof(val) === 'string'
	|| typeof(val) === 'boolean'
	|| typeof(val) === 'number') {
		return val
	}

	if (typeof(val) == 'object') {
		return '{ ' + Object.entries(val).map(([k, v]) => toFateString(k) + '": ' + (typeof(v) === 'string' ? '"' + toFateString(v) + '"' : toFateString(v)) ).join(', ') + ' }'
	}

	if (typeof(val) == 'function') {
		return '() -> { ... }'
	}

	return '<unknown type: ' + val + '>'
}

module.exports = builtins