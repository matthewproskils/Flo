const peg = require("pegjs");

const GRAMMAR = require('./grammar.pegjs')

const parser = peg.generate(GRAMMAR);