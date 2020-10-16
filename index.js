#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const lib = require('./lib.js');


if(argv.help) {
	lib.printHelp();
	return;
} 


var env = lib.getEnv(argv, lib.defaults);
var out = new lib.Output();


var propFilter = (propKey, propVal) => {
	if(propKey == env.selectedProperty) {
		return [propKey, propVal];
	}
}


var chunkReader = new lib.ChunkReader();


var input = new lib.Input(env.inputFilePath, 
	(chunk) => {
		chunkReader.receive(chunk);
	},
	() => {
		chunkReader.end();
		out.printAsList();
	}
);

chunkReader.paragraphHandler = (paragraphText, index) => {
	if(env.startIndex === null) {
		var properties = lib.splitParagraph(paragraphText, (env.selectedProperty ? propFilter : null) );
		if((Object.keys(properties).length > 0)) {
			out.pushItem(properties, index);
			if (out.data.length > env.sampleSize ) {
				out.data.shift();
			} 
		}	
	} else if(index >= env.startIndex) {
		var properties = lib.splitParagraph(paragraphText, (env.selectedProperty ? propFilter : null) );
		if((Object.keys(properties).length > 0)) {
			if (out.data.length < env.sampleSize ) {
				out.pushItem(properties, index);
			} else {
				input.close();
			}
		}			
	}
}

input.begin();

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