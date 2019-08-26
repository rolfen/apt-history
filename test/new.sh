#!/bin/bash

# Make sure we are in the test root in case the script was called from outside the root
cd ${BASH_SOURCE%/*}

# Run a few test cases

cat stdin/history_sample.log |node ../index.js --last 2 > stdout/last-2.out

cat stdin/short_history_sample.log |node ../index.js > stdout/short-input.out


# Show test result deviations
git diff ./stdout

# Tidy up
cd -