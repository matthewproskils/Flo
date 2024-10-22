class Scope {
	constructor(scope, parentScope) {
		this.scope = scope;
		this.parentScope = parentScope;
	}

	get(symbol) {
		if (symbol in this.scope) {
			return this.scope[symbol];
		}
		if (this.parentScope) {
			return this.parentScope.get(symbol);
		}
	}

	set(symbol, value) {
		this.scope[symbol] = value
	}

	//for objects
	objset(symbol, other, value) {
		this.scope[symbol][other] = value
	}
}

module.exports = Scope
