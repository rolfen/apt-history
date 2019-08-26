#!/bin/bash

# Make sure we are in the test root in case the script was called from outside the root
cd ${BASH_SOURCE%/*}

# Run a few test cases
cat stdin/history_sample.log |node ../index.js > stdout/no-args.out
cat stdin/history_sample.log |node ../index.js from 1 > stdout/first.out
cat stdin/history_sample.log |node ../index.js --last 2 > stdout/last-2.out
cat stdin/history_sample.log |node ../index.js 29 > stdout/single-record.out

# Show test result deviations
git diff

# Tidy up
cd -