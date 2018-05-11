#!/usr/bin/env node

'use strict';

var args = process.argv;

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
	var firstArg = args[2];
	var secondArg = args[3];
	var thirdArg = args[4];
	var negativeIndex;

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


	if(!isNaN(firstArg)) {
		negativeIndex = parseInt(firstArg);
	}

	if(!negativeIndex) {
		var tailOffset = transactions.length - 10;
		var commands = transactions.map(function(transaction){
			return(transaction.Commandline);
		})
		var output = commands.splice(tailOffset).map(function(command, n) {
			return " @" + (tailOffset + n) +  " " + command;
		});
		output = output.reverse().map(function(l, n) {
			return n + l;
		});
		console.log(output.join("\n"));		
	} else {
		var index = transactions.length - negativeIndex;
		if (secondArg) {
			var attributeName;
			if(secondArg) {
				if(thirdArg && thirdArg == "as-package-list") {

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

