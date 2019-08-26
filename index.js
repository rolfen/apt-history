#!/usr/bin/env node

'use strict';

var argv = require('minimist')(process.argv.slice(2));

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

