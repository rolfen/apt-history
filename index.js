#!/usr/bin/env node

/**
 * Todo: I have installed minimist.
 *       Should write tests for the whole script
 *		 Then breakdown old argument parsing code and 
 *       move it to minimist.
 **/

'use strict';

var argv = require('minimist')(process.argv.slice(2));

var args = process.argv.slice(2);


var stdin = process.stdin,
    stdout = process.stdout,
    inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
	var transactions = parseAptLog(inputChunks.join());

	var firstArg = args[0];
	var secondArg = args[1];
	var thirdArg = args[2];
	var argCursor = 0;


	/*

	var atLine: undefined
	var asPackageList = false;
	var getAttribute = undefined;

	args.splice(2).forEach(function(arg, i){
		if(arg[0] == "@") {
			atLine = arg.substr(1);
		} else if(arg == "package-list") {
			asPackageList = true;
		} else if (arg == "get-attribute") {
			getAttribute = arg[i+1];
		}
	});

	*/


	var propertyName = "Commandline"; // default

	if(!isNaN(argv["_"][0])) {

		// first argument is a numerical index, show single record

		var index = parseInt(argv["_"][0]);
		var record = transactions[index];

		// then second argument may be the property name
		propertyName = argv["_"][1] ? argv["_"][1] : null;

		if (propertyName) {
			// show single property in the record
			var out;
			if (argv["as-apt-arguments"]) {
				out = record[propertyName].replace(/\([^\(]+\)/g,'').replace(/ , /g,' ').trim();
			} else {
				out = record[propertyName];
			}
			console.log(out);
		} else {
			console.dir(record);
		}

	} else {
		// list

		propertyName = argv["_"][0] ? argv["_"][0] : propertyName;

		const sampleSize = 10;

		if(argv["from"] && !isNaN(argv["from"])) {
			var tailOffset = parseInt(secondArg);
		} else {
			var tailOffset = transactions.length - sampleSize;
		}

		var output = transactions.splice(tailOffset, sampleSize).map(function(transaction, n) {
			if(transaction[propertyName] !== undefined) {
				return (tailOffset + n) +  " " + transaction[propertyName];
			} 
		}).filter(l => l !== undefined);

		console.log(output.join("\n"));		
	}
});

function parseAptLog(logText) {
	// parse APT history log (string) into object
	return ( 
		logText.split("\n\n").map(function(transaction){
	    	var lines = transaction.split("\n");
	    	var attributes = {};
	    	lines.forEach(function(line){
	    		var attributeTuple = line.split(': ',2);
	    		if(attributeTuple.length == 2) {
		    		attributes[attributeTuple[0]] = attributeTuple[1];
	    		}
	    	})
	    	return(attributes);
	    })
    );
}

