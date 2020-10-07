#!/usr/bin/env node

'use strict';

const DEFAULT_LOG_FILE = "/var/log/apt/history.log";

const process = require('process');
const fs = require('fs');


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


function getEnv(argv) {
	// builds the env (environment) object based on defaults and on command line arguments (argv) compiled by the minimist module

	// parse command line arguments and set options

	var env = { // defaults
		'isListMode' : true,
		'isStdinInput' : false,
		'selectedProperty' : null,
		'inputFilePath' : DEFAULT_LOG_FILE,
		'sampleSize' : 10,
		'startIndex' : null // null = automatic
	};

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
			env.selectedProperty = 'Commandline';
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


function getInputFh(env, fs) {

	// gets input file handle
	
	var fh;
	
	if(env.isStdinInput) {
		fh = process.stdin;
	} else {
		fh = fs.createReadStream(env.inputFilePath);
	}
	
	return fh;
}


function readFh(env, results, fh, onParagraph) {

	// reads text stream from opened file handle fh and calls onParagraph for every encountered paragraph

	var index = 0;
	var buffer = '';

	fh.setEncoding('utf8');

	fh.on('data', function (chunk) {
		let split = chunk.split("\n\n");
		buffer += split[0];
		if(split.length > 1) {
			split.slice(1).forEach((slice) => {
				onParagraph(env, results, buffer, index);
				buffer = '';
				index ++;
				buffer += slice;
			});
		}
	});

	fh.on('end', function() {
		if (buffer.length > 0) {
			onParagraph(env, results, buffer, index);
		}
	});
}


function paragraphReceived(env, results, paragraphText, index) {

	// processed paragraph text; splits it into properties, filter them, and push the results to results object

	var lines = paragraphText.split("\n");
	var props = {};
	lines.forEach(function(line){
		var [propKey, propVal] = line.split(': ',2);
		if( propKey )  {
			if ( !env.selectedProperty || (env.selectedProperty == propKey) ) {
	    		props[propKey] = propVal;
			}
		}
	})
	results.pushParagraph(props, index);
}


class Results {

	// holds selected data

	constructor(env) {
		this.env = env;
		this.data = [];
	}

	pushParagraph(properties, index) {
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
	'getEnv' : getEnv,
	'printHelp' : printHelp
};
