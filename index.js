#!/usr/bin/env node

const DEBUG = !true;

//Modules
const fs = require("fs");
const peg = require("pegjs");

if (DEBUG) {
	startMem = process.memoryUsage().heapUsed
	startTime = process.hrtime.bigint();
}
const interpret = require("./src/Interpreter.js");

//GET INPUT
let input = fs.readFileSync("code.fate").toString();

//PegJs
const grammar = fs.readFileSync("./src/grammar.pegjs").toString();
const parser = peg.generate(grammar)
//Parse Input

let ok = true

let ast = []
try {
	ast = parser.parse(input)
} catch (err) {
	const lno = err.location.start.line
	const s = ('' + lno).length + err.location.start.column + 2
	const e = err.location.end.column - err.location.start.column
	console.log('\x1b[31m')
	console.log(`${lno} | ${input.split(/\n/g)[lno - 1]}`)
	console.log(`${' '.repeat(s)}\x1b[1A\x1b[36m\x1b[1C\x1b[31m\x1b[${'^'.repeat(e)}`, '\n')
	console.log('Syntax Error:', err.message)

	ok = false
}

if (DEBUG) {
	console.log("\x1b[92m")
	console.log("AST", JSON.stringify(ast, null, 1))
	console.log('\x1b[0m')
}
//Interpret
let output;
if (ok) {
	output = interpret(ast);
}

if (DEBUG) {
	let endTime = process.hrtime.bigint()
	let endMem = process.memoryUsage().heapUsed

	console.log("\x1b[0m\x1b[2m")
	console.log(`Took ${(endTime - startTime) / 1000000n} ms or ${endTime - startTime} ns`);
	console.log(`Used ${(endMem - startMem) / 1024} KB of memory`)
}
