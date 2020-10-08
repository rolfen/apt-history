#!/usr/bin/env node

'use strict';

const process = require('process');
const fs = require('fs');


const DEFAULT_LOG_FILE = "/var/log/apt/history.log";
const DEFAULT_LIST_PROPERTY = "Commandline";

function printHelp() {
	console.log("LIST");
	console.log("  apt-history [<property>] [--from <N>] [--limit <N>]");
	console.log("SINGLE ITEM");
	console.log("  apt-history <index> [<property>] [--as-apt-arguments]");
	console.log("COMMON OPTIONS");
	console.log("  Specify data: {--input <file>|--stdin}");
	console.log("NOTES");
	console.log("  Common APT properties:");
	console.log("    Commandline, Requested-By, Install, Start-Date, End-Date, Purge, Remove");
	console.log("  Defaults:");
	console.log("    apt-history Commandline --from 0 --limit 5 --input " + defaultLogFile);
}


var defaults = { 
	'isListMode' : true,
	'isStdinInput' : false,
	'selectedProperty' : null,
	'inputFilePath' : DEFAULT_LOG_FILE,
	'sampleSize' : 10,
	'startIndex' : null // null = automatic
};

function getEnv(argv, env) {
	// builds the env (environment) object based on defaults and on command line arguments (argv) compiled by the minimist module

	// parse command line arguments and set options

	if(!isNaN(argv["_"][0])) {
		// first argument is a numerical index, show single record
		env.isListMode = false;
		if(argv["_"][1]) {
			// second argument may be the property name
			env.selectedProperty = argv["_"][1];
		}
	} else {
		// list mode
		if(argv["_"][0]) {
			env.selectedProperty = argv["_"][0];
		} else {
			env.selectedProperty = DEFAULT_LIST_PROPERTY;
		}
	}

	if(argv.s || argv.stdin) {
		env.isStdinInput = true;
	} else if(argv.input) {
		env.inputFilePath = argv.input;
	}

	if(argv["limit"] && !isNaN(argv["limit"])) {
		env.sampleSize = argv["limit"];
	} 

	if(argv["from"] && !isNaN(argv["from"])) {
		env.startIndex = parseInt(argv["from"]);
	}

	return env;

}


function getInput(env, onData, onEnd) {

	
	var fh;
	
	if(env.isStdinInput) {
		fh = process.stdin;
	} else {
		fh = fs.createReadStream(env.inputFilePath);
	}

	fh.setEncoding('utf8');
	fh.on('data', onData);
	fh.on('end', onEnd);

	return fh;
}

class ChunkReader {
	constructor(paragraphHandler) {
		this.index = 0;
		this.buffer = '';
		this.paragraphHandler = paragraphHandler;
	}
	receive(chunk) {
		let split = chunk.split("\n\n");
		this.buffer += split[0];
		if(split.length > 1) {
			split.slice(1).forEach((slice) => {
				this.paragraphHandler(this.buffer, this.index);
				this.buffer = '';
				this.index ++;
				this.buffer += slice;
			});
		}
	}
	end() {
		if (this.buffer.length > 0) {
			this.paragraphHandler(this.buffer, this.index);
		}
	}
}

function splitParagraph(paragraphText, selectedProperty) {

	// splits paragraph into properties

	var lines = paragraphText.split("\n");
	var props = {};
	lines.forEach(function(line){
		var [propKey, propVal] = line.split(': ',2);
		if( propKey )  {
			if ( !selectedProperty || (selectedProperty == propKey) ) {
	    		props[propKey] = propVal;
			}
		}
	})

	return props;
}


class Results {

	// holds selected data

	constructor(env) {
		this.env = env;
		this.data = [];
	}

	pushPropGroup(properties, index) {
		this.data.push({'index': index, 'properties': properties });
	}
}


function printList(arr) {
	var str = arr.map((row) => {
		return(row.join("\t"));
	}).join("\n");
	console.log(str);
}

function printProperty(str) {
	console.log(str);
}

function printRecord(record) {
	var newRecord = Object.assign({}, record);
	delete newRecord._index;
	console.dir(newRecord);
}


module.exports = {
	'defaults' : defaults,
	'getEnv' : getEnv,
	'printHelp' : printHelp,
	'getInput' : getInput,
	'ChunkReader' : ChunkReader
};
