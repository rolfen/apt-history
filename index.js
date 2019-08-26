#!/usr/bin/env node

/**
 * Todo: I have installed minimist.
 *       Should write tests for the whole script
 *		 Then breakdown old argument parsing code and 
 *       move it to minimist.
 **/

'use strict';

// var argv = require('minimist')(process.argv.slice(2));

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

	var index;

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


	if(!firstArg || isNaN(firstArg)) {
		// list

		var listIndex = "Commandline";
		const sampleSize = 10;

		if(firstArg && firstArg == "from" && !isNaN(secondArg)) {
			var tailOffset = parseInt(secondArg);
			argCursor += 2;
		} else {
			var tailOffset = transactions.length - sampleSize;
		}

		if(args[argCursor]) {
			listIndex = args[argCursor];
		}


		var output = transactions.splice(tailOffset, sampleSize).map(function(transaction, n) {
			if(transaction[listIndex] !== undefined) {
				return (tailOffset + n) +  " " + transaction[listIndex];
			} 
		}).filter(l => l !== undefined);

		console.log(output.join("\n"));		
	} else {
		// first argument is an index, select operation

		index = parseInt(firstArg);
		if (secondArg) {
			var attributeName;
			if(secondArg) {
				if(thirdArg && thirdArg == "--as-apt-arguments") {
					console.log(transactions[index][secondArg].replace(/\([^\(]+\)/g,'').replace(/ , /g,' '));
				} else {
					console.log(transactions[index][secondArg]);
				}
			} else {
				console.log(transactions[index]);
			} 
		} else {
			console.log(transactions[index]);
		}
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

