#!/usr/bin/env node

const DEBUG = !true;

//Modules
const fs = require("fs");
const peg = require("pegjs");

//Data Count
if (DEBUG) {
	startMem = process.memoryUsage().heapUsed
	startTime = process.hrtime.bigint();
	//Getting Other Files
	const interpret = require("./new/Interpreter.js");

	//GET INPUT
	let input = fs.readFileSync("code.fate").toString();

	//PegJs
	const grammer = fs.readFileSync("./new/grammar.pegjs").toString();
	const parser = peg.generate(grammer)

	//Parse Input
	let ast = parser.parse(input)
	console.log("\x1b[92m")
	console.log("AST", JSON.stringify(ast, null, 1))
	console.log('\x1b[0m')

	const output = interpret(ast)
	let endTime = process.hrtime.bigint()
	let endMem = process.memoryUsage().heapUsed

	console.log("\x1b[0m\x1b[2m")
	console.log(`Took ${(endTime - startTime) / 1000000n} ms or ${endTime - startTime} ns`);
	console.log(`Used ${(endMem - startMem) / 1024} KB of memory`)
}else{
	//Getting Other Files
	const interpret = require("./new/Interpreter.js");

	//GET INPUT
	let input = fs.readFileSync("code.fate").toString();

	//PegJs
	const grammer = fs.readFileSync("./new/grammar.pegjs").toString();
	const parser = peg.generate(grammer)

	//Parse Input
	let ast = parser.parse(input)

	const output = interpret(ast)
}