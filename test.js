#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const assert = require('assert').strict;
const lib = require('./lib.js');

testGetEnv();

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