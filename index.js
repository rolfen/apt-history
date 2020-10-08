#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const lib = require('./lib.js');


if(argv.help) {
	lib.printHelp();
	return;
} 


var env = lib.getEnv(argv, lib.defaults);
var res = new lib.Results();

var chunkReader = new lib.ChunkReader( (paragraphText, index) => {
	var propGroup = lib.splitParagraph(paragraphText, 'Upgrade');
	res.pushItem(propGroup, index);
} );

lib.getInput('./test/stdin/history_sample.log', 
	(chunk) => {
		chunkReader.receive(chunk);
	},
	() => {
		chunkReader.end();
		console.dir(res.data);
	} 
);

/*


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


*/