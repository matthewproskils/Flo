#!/usr/bin/env node

let startMem = process.memoryUsage().heapUsed
let startTime = process.hrtime.bigint();

const fs = require("fs");
const { Lexer } = require("./lexer.js");
const { evaluator } = require("./interpreter.js");

//GET INPUT
let input = fs.readFileSync("code.fate").toString();
let lexed = new Lexer().process(input);
//console.log("Syntax Tree:", JSON.stringify(lexed, null, 2));
console.log(lexed);
console.log("\nEvaluator message:");
lexed.forEach(el => {
    evaluator.evaluate(el, evaluator.globalScope);
});
////////////////////////////////////////////////////////////
//const { interpret, globalScope } = require("./new/Interpreter.js");

//interpret(lexed, globalScope);
////////////////////////////////////////////////////////////

let endTime = process.hrtime.bigint()
let endMem = process.memoryUsage().heapUsed

console.log("\x1b[2m")
console.log(`Took ${(endTime - startTime) / 1000000n} ms or ${endTime - startTime} ns`);
console.log(`Used ${(endMem - startMem) / 1024} KB of memory`)