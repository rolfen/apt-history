#!/usr/bin/env node

'use strict';

const DEFAULT_LOG_FILE = "/var/log/apt/history.log";

const process = require('process');
const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert').strict;
const fs = require('fs');

if(argv.help) {
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
	return;
} 



function getEnv() {
	// builds the env (environment) object based on defaults and on command line arguments (argv)

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


function getInputFh(env) {

	// gets input file handle
	
	const fh;
	
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


Class Results(env) {

	// holds selected data

	constructor() {
		this.env = env;
		this.data = [];
	}

	pushParagraph(properties, index) {
		this.data.push({'index': index, 'properties': properties });
	}
}

// ---------------



/*

if(argv.input) {
	// input file is specified
	fs.readFile(argv.input, 'utf8', function(err, content) {
	    main(content);
	});
} else if(argv.s || argv.stdin) {
	// read from stdin
	readStdin(function(stdinText) {
		main(stdinText);
	});	
} else {
	// try to find apt log
	fs.readFile(defaultLogFile, 'utf8', function(err, content) {
	    main(content);
	});
}

*/



function main(logText) {

	var stdout = process.stdout;

	var propertyName = "Commandline"; // default

	if(!isNaN(argv["_"][0])) {

		// first argument is a numerical index, show single record

		var index = parseInt(argv["_"][0]);

		var transactions = parseAptLog(logText, index, 1);

		var record = transactions[0];

		// then second argument may be the property name

		if (argv["_"][1]) {
			// show specific properties in the record
			var out = record[argv["_"][1]];
			if(typeof(record) !== "undefined") {
				if (argv["as-apt-arguments"]) {
					out = out.replace(/\([^\(]+\)/g,'').replace(/ , /g,' ').trim();
				} 			
			}
			printProperty(out);
		} else {
			printRecord(record);
		}

	} else {
		// list

		var blocks = getBlocks(logText);


		// propertyName = argv["_"][0] ? argv["_"][0] : propertyName;

		/*
		if(argv["limit"] && !isNaN(argv["limit"])) {
			var sampleSize =argv["limit"];
		} else {
			var sampleSize = 10;
		}
		*/

		// Having sample size bigger than actual data messes with indices
		sampleSize = Math.min(sampleSize, transactions.length);

		//if((typeof(argv["from"]) !== "undefined") && !isNaN(argv["from"])) {
		//	var startIndex = parseInt(argv["from"]);
		//} 

		var output = [];


		for (let i = blocks.length; i > 0; i--) {	// loop from the end
			let t = getProperties(blocks[i - 1]);	// zero-based index
			if (t[propertyName] !== undefined) {
				output.unshift([t['_index'], t[propertyName]]); // this is one output line
			}
			if (output.length == sampleSize) {
				break;
			}
		}

		printList(output);		
	}
};

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

/*
function getProperties(blockText, selectedProps) {
	var lines = blockText.split("\n");
	var hasSelectedProps = (selectedProps !== undefined) && (Array.isArray(electedProps));
	var attributes = {};
	lines.forEach(function(line){
		var attributeTuple = line.split(': ',2);
		if( attributeTuple.length == 2 && (!hasSelectedProps || hasSelectedProps.includes(attributesTuple[1])) )  {
    		attributes[attributeTuple[0]] = attributeTuple[1];
		}
	})
	return(attributes);
}
*/

/*
function getBlocks(text) {
	return(text.split("\n\n"));
}
*/

/*
function parseAptLog(logText, start, size) {
	// parse APT history log (string) into object


	logText.split("\n\n").slice(start).map(function(transaction, n){
    	var lines = transaction.split("\n");
    	var attributes = {};
    	lines.forEach(function(line){
    		var attributeTuple = line.split(': ',2);
    		if(attributeTuple.length == 2) {
	    		attributes[attributeTuple[0]] = attributeTuple[1];
    		}
    	})
    	attributes["_index"] = n + start;
    	return(attributes);
    })
	return ( 

    );
}
*/

