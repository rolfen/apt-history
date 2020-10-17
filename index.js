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
	(chunk) => {											// input chunk received
		chunkReader.receive(chunk);
	},
	() => {													// done parsing input
		chunkReader.end();
		if(env.sampleSize == 1) {
			if(env.selectedProperty && env.aptFormat) {
				out.printLine(out.data[0].properties[env.selectedProperty].replace(/\([^\(]+\)/g,'').replace(/ , /g,' ').trim());
			} else {
				out.printObject(out.data[0].properties);
			}
		} else {
			out.printAsList();
		}
	}
);

chunkReader.paragraphHandler = (paragraphText, index) => {

	var properties = lib.splitParagraph(paragraphText, (env.selectedProperty ? propFilter : null) );

	if((Object.keys(properties).length > 0)) {				// skip empty items
		if(env.startIndex === null) {						// no start index provided, go to "tail" behavior
			out.pushItem(properties, index);				// ... which means, just pushing the item onto the sample
			if (out.data.length > env.sampleSize ) {		// ... and remove an item from the beginning if maximum sample size is exceeded
				out.data.shift();
			} 
		} else if(index >= env.startIndex) {				// ignore everything before start index if it is provided
			if (out.data.length < env.sampleSize ) {		// push until maximum sample size is reached
				out.pushItem(properties, index);
			} else {
				input.close();								// and stop parsing input
			}
		}
	}	
}

input.begin();