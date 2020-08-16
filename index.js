#!/usr/bin/env node

//Modules
const fs = require("fs");
const peg = require("pegjs");

//Data Count
let startMem = process.memoryUsage().heapUsed
let startTime = process.hrtime.bigint();

//Getting Other Files
const { interpret, globalScope } = require("./new/Interpreter.js");

//GET INPUT
let input = fs.readFileSync("code.fate").toString();

//PegJs
const grammer = fs.readFileSync("./new/grammar.pegjs").toString();
const parser = peg.generate(grammer)

//Parse Input
// input = input.split(',pls,')
const ast = parser.parse(input)

console.log("\x1b[92m")
console.log("AST", JSON.stringify(ast, null, 1))
console.log('\x1b[0m')


const output = interpret(ast, globalScope)

console.log('\x1b[33m')
console.log(output)

//Count Time / Data / Whatsnot
let endTime = process.hrtime.bigint()
let endMem = process.memoryUsage().heapUsed

console.log("\x1b[0m\x1b[2m")
console.log(`Took ${(endTime - startTime) / 1000000n} ms or ${endTime - startTime} ns`);
console.log(`Used ${(endMem - startMem) / 1024} KB of memory`)

//Old Stuff
/*let lexed = new Lexer().process(input);
console.log("Syntax Tree:", JSON.stringify(lexed, null, 2));
//console.log(lexed);
console.log("\nEvaluator message:");
lexed.forEach(el => {
    evaluator.evaluate(el, evaluator.globalScope);
});

interpret(lexed, globalScope);*/
//const { Lexer } = require("./lexer.js");
//const { evaluator } = require("./interpreter.js");