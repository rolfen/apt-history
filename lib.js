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
	'inputFilePath' : null,
	'sampleSize' : 10,
	'startIndex' : null // null = automatic
};

function getEnv(argv, env) {
	// builds the env (environment) object based on defaults and on command line arguments (argv) compiled by the minimist module

	// parse command line arguments and set options

	if(argv["from"] && !isNaN(argv["from"])) {
		env.startIndex = parseInt(argv["from"]);
	}

	if(!isNaN(argv["_"][0])) {
		// first argument is a numerical index, show single record
		env.isListMode = false;
		env.startIndex = argv["_"][0];
		env.sampleSize = 1;
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
		if(argv["limit"] && !isNaN(argv["limit"])) {
			env.sampleSize = argv["limit"];
		} 
	}

	if(argv.s || argv.stdin) {
		env.isStdinInput = true;
	} else if(argv.input) {
		env.inputFilePath = argv.input;
	} else {
		env.inputFilePath = DEFAULT_LOG_FILE;
	}

	return env;

}


function oopsie(desc) {
	if(typeof desc === 'object' && desc !== null) {
		throw new Error(JSON.stringify(desc));
	} else {
		throw new Error(desc)
	}
}

class Input {

	constructor(inputFilePath, onData, onEnd) {
		
		this.inputFilePath = inputFilePath;

		this.onData = onData;
		this.onEnd = onEnd;
		this.stream = undefined;

		this.isClosing = false;

	}

	begin() {
		this.makeStream((err, stream) => {
			if(err) {
				oopsie(err);
			} else {
				this.stream = stream;
				this.startInput();
			}
		});
	}

	makeStream(callback) {
		var openCallback = (err, fd) => {
			var stream;
			if(err) {
				callback(err, null);
			} else {
				stream = fs.createReadStream("", { 
					highWaterMark: 2 * 1024,
					fd : fd
				});

				stream.setEncoding('utf8');

		        // if (e.code === 'EAGAIN') {
		        // }
		        callback(null, stream);
		
			}
		}

		if(this.inputFilePath ) {
			fs.open(this.inputFilePath, 'r', openCallback);
		} else {
			openCallback(null, process.stdin.fd);
		}
	}

	startInput() {

		// node starts the input stream when a data event is added

		// this.stream.on('end', this.onEnd);		
		this.stream.on('close', this.onEnd);	
		this.stream.on('data', this.onData);
	}

	close() {
		!this.isClosing && this.stream.destroy();
		this.isClosing = true;
	}

}

class ChunkReader {
	constructor(paragraphHandler) {
		this.index = 0;
		this.buffer = '';
		this.paragraphHandler = paragraphHandler;
		this.isEnded = false;
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


function splitParagraph(paragraphText, propFilter) {

	// splits paragraph into properties

	var lines = paragraphText.split("\n");
	var props = {};
	lines.forEach(function(line){
		var [propKey, propVal] = line.split(': ',2);
		if ( propFilter ) {
			let filteredProp = propFilter(propKey, propVal);
			if(filteredProp && Array.isArray(filteredProp) ) {
				props[filteredProp[0]] = filteredProp[1];
			}
		} else {
			props[propKey] = propVal;
		}
	})

	return props;
}




class Output {

	// holds selected data

	constructor() {
		this.data = [];
		this.printLine = console.log;
		this.printObject = console.dir;
	}

	pushItem(properties, index) {
		this.data.push({'index': index, 'properties': properties });
	}

	printAsList() {
		this.data.forEach( (item) => {
			this.printLine( [ item.index, ...Object.values(item.properties)].join("\t") );
		});
	}

}




module.exports = {
	'defaults' : defaults,
	'getEnv' : getEnv,
	'printHelp' : printHelp,
	'Input' : Input,
	'ChunkReader' : ChunkReader,
	'Output' : Output,
	'splitParagraph' : splitParagraph
};
