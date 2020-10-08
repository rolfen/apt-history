#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert').strict;
const lib = require('./lib.js');
const fs = require('fs');

try {
	testGetEnv();
	testChunkReader();
} catch(err) {
	console.dir(err);
}

function testGetEnv() {
	const getEnv = lib.getEnv;
	var env;

	env = lib.getEnv({
		'_' : [23]
	},{
		isListMode : false
	});
	assert.equal(env.isListMode, false, "Numerical first argument triggers item mode")

	env = lib.getEnv({
		'_' : ['SomeProp']
	}, {
		selectedProperty : null
	})
	assert.equal(env.selectedProperty, 'SomeProp', "Manually select property")


}


function testChunkReader() {
	
	var paragraphs = [];
	
	var chunkReader = new lib.ChunkReader((paragraph, index) => {
		paragraphs.push({
			i: index,
			p: paragraph
		});
	});
	
	chunkReader.receive("Paragraph 1, l");
	chunkReader.receive("ine 1\nParagraph 1, line 2\n\nParagraph 2, line");
	chunkReader.receive(" 1\nParagraph 2, line 2\nPara");
	chunkReader.receive("graph 2, line 3");
	chunkReader.end();

	assert.deepEqual(
		[{
			i: 0,
			p: "Paragraph 1, line 1\nParagraph 1, line 2"
		},{
			i: 1,
			p: "Paragraph 2, line 1\nParagraph 2, line 2\nParagraph 2, line 3"
		}],
		paragraphs,
		"Expected data does not match"
	);
}

/*
function testGetInputFh() {

		const sampleFilePath = './test/testdata/samplefile.txt';
		let fh = lib.getInputFh({
			inputFilePath : sampleFilePath,
			isStdinInput : false
		});
		var contents = fs.readFileSync(fh);
		fh.close();
		assert.equal(contents, fs.readFileSync(sampleFilePath), "Did not load the right file");

}
*/