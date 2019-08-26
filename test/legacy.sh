#!/bin/bash

# This file contains tests for deprecated functionality

# Make sure we are in the test root in case the script was called from outside the root
cd ${BASH_SOURCE%/*}

# Run a few test cases

# Show test result deviations
git diff ./stdout

# Tidy up
cd -