#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert').strict;
const lib = require('./lib.js');
const fs = require('fs');

testGetEnv();
testGetInputFh();

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


function testGetInputFh() {

	try {
		let fh = lib.getInputFh({
			inputFilePath : './test/testdata/samplefile.txt',
			isStdinInput : false
		});
	} catch (err) {
		assert.fail("Opening regular file failed");
	}

}