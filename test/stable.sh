#!/bin/bash

# Make sure we are in the test root in case the script was called from outside the root
cd ${BASH_SOURCE%/*}

# Run a few test cases

# default output
cat stdin/history_sample.log |node ../index.js > stdout/no-args.out

# handle short input properly
cat stdin/short_history_sample.log |node ../index.js > stdout/short-input.out

# show only last two records
cat stdin/history_sample.log |node ../index.js --last 2 > stdout/last-2.out

# examine single record
cat stdin/history_sample.log |node ../index.js 29 > stdout/single-record.out

# apt-argument list output format
cat stdin/history_sample.log |node ../index.js 29 Install --as-apt-arguments > stdout/as-apt-arguments.out

# Done! Show test result deviations
git diff ./stdout

# Tidy up
cd -