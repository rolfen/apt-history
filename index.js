#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const lib = require('./lib.js');

if(argv.help) {
	lib.printHelp();
	return;
} 


var env = lib.getEnv(argv);

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


function readStdin(onEnd) {
	var stdin = process.stdin;
	var inputChunks = [];

	stdin.resume();
	stdin.setEncoding('utf8');

	stdin.on('data', function (chunk) {
	    inputChunks.push(chunk);
	});

	stdin.on('end', function() {
		var stdinText = inputChunks.join();
		onEnd(stdinText);
	});
}


function main(logText) {

	var stdout = process.stdout;

	var transactions = parseAptLog(logText);

	var propertyName = "Commandline"; // default

	if(!isNaN(argv["_"][0])) {

		// first argument is a numerical index, show single record

		var index = parseInt(argv["_"][0]);
		var record = transactions[index];

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

		propertyName = argv["_"][0] ? argv["_"][0] : propertyName;

		// What's wrong with piping to tail? Meh. 
		if(argv["limit"] && !isNaN(argv["limit"])) {
			var sampleSize =argv["limit"];
		} else {
			var sampleSize = 10;
		}

		// Having sample size bigger than actual data messes with indices
		sampleSize = Math.min(sampleSize, transactions.length);

		if((typeof(argv["from"]) !== "undefined") && !isNaN(argv["from"])) {
			var tailOffset = parseInt(argv["from"]);
		} else {
			var tailOffset = transactions.length - sampleSize;
		}


		var output = [];


		for (let i = transactions.length; i > 0; i--) {		// loop from the end
			let t = transactions[i - 1]; // zero-based index
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

function parseAptLog(logText) {
	// parse APT history log (string) into object
	return ( 
		logText.split("\n\n").map(function(transaction, n){
	    	var lines = transaction.split("\n");
	    	var attributes = {};
	    	lines.forEach(function(line){
	    		var attributeTuple = line.split(': ',2);
	    		if(attributeTuple.length == 2) {
		    		attributes[attributeTuple[0]] = attributeTuple[1];
	    		}
	    	})
	    	attributes["_index"] = n;
	    	return(attributes);
	    })
    );
}

*/