#!/usr/bin/env node
const fs = require("fs");
const Lexer = require("./lexer.js").Lexer;
const evaluator = require("./interpreter.js").evaluator;
//GET INPUT
let input = fs.readFileSync("code.fate").toString();
let lexed = new Lexer().process(input);

//console.log("Syntax Tree:");
//console.log(lexed);

console.log("Evaluator message:");
evaluator.process(lexed);