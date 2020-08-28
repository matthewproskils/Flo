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
    run: (...args) => {
      process.stdout.write(args.map(toFateString).join(''))
    }
  },
  "println": {
    type: "function",
    run: (...args) => {
      process.stdout.write(args.map(toFateString).join('') + '\n')
    }
  },
  "evalJS": {
    type: "function",
    run: args => {
      return eval(args);
    }
  },
  "typeOf": {
    type: "function",
    run: args => {
      return typeof (args)
    }
  },
  "floor": {
    type: "function",
    run: args => {
      return Math.floor(args)
    }
  },
  "stringify": {
    type: "function",
    run: args => {
      return JSON.stringify(args)
    }
  },
  "import": {
    type: "function",
    run: args => {
      return require("fs").readFileSync(args).toString()
    }
  },
  'join': {
    type: "function",
    run: (...args) => {
      return args.join('')
    }
  },
  'wait': {
    type: "function",
    run: args => {
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

  if (typeof (val) == 'string') {
    return val
  }

  if (typeof (val) === 'boolean' || typeof (val) === 'number') {
    return JSON.stringify(val)
  }

  if (Array.isArray(val)) {
    return JSON.stringify(val)
  }

  if (typeof (val) == 'object') {
    return JSON.stringify(val)
  }

  if (typeof (val) == 'function') {
    return '() -> { ... }'
  }
  return '<unknown type: ' + val + '>'
}

module.exports = builtins
