function sleep(miliseconds) {
	var currentTime = new Date().getTime();

	while (currentTime + miliseconds * 1000 >= new Date().getTime()) {
	}
}

const builtins = {
	"math": {
		"PI": Math.PI,
		"E": Math.E,
		"SQRT2": Math.SQRT2,
		"SQRT1_2": Math.SQRT1_2,
		"LOG10E": Math.LOG10E,
		"LOG2E": Math.LOG2E,
		"LN10": Math.LN10,
		"LN2": Math.LN2
	},
	"print": {
		type: "function",
		call: (...args) => {
			args = args.map(el => { return toFateString(el) })
			process.stdout.write(args.join('') + '\n')
		}
	},
	"println": {
		type: "function",
		call: args => {
			if (typeof (args) == 'object') {
				console.log(args)
			} else {
				process.stdout.write(toFateString(args) + '\n')
			}
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
			return typeof (args)
		}
	},
	"floor": {
		type: "function",
		call: args => {
			return Math.floor(args)
		}
	},
	"stringify": {
		type: "function",
		call: args => {
			return JSON.stringify(args)
		}
	},
	"import": {
		type: "function",
		call: args => {
			return require("fs").readFileSync(args).toString()
		}
	},
	'join': {
		type: "function",
		call: (...args) => {
			return args.join('')
		}
	},
	'wait': {
		type: "function",
		call: args => {
			sleep(parseInt(args))
		}
	}
}

const isObject = function(a) {
	return (!!a) && (a.constructor === Object);
};

function toFateString(val) {
	if (val === null) {
		return "null"
	}
	if (typeof (val) === 'string'
		|| typeof (val) === 'boolean'
		|| typeof (val) === 'number') {
		if (typeof (val) == 'string') {
			//JSON.stringify adds quotation marks to string
			return val
		} else {
			return JSON.stringify(val)
		}
	}

	if (typeof (val) == 'object') {
		if (Array.isArray(val)) {
			return JSON.stringify(val)
		} else {
			return JSON.stringify(val)
		}
	}

	if (typeof (val) == 'function') {
		return '() -> { ... }'
	}
	return '<unknown type: ' + val + '>'
}

module.exports = builtins
