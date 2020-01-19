#!/bin/bash

# Make sure we are in the test root in case the script was called from outside the root
cd ${BASH_SOURCE%/*}

# Run a few test cases

# default output
cat stdin/history_sample.log |node ../index.js -s > stdout/no-args.out

# handle short input properly
cat stdin/short_history_sample.log |node ../index.js -s > stdout/short-input.out

# show only last two records
cat stdin/history_sample.log |node ../index.js --limit 2 -s > stdout/last-2.out

# examine single record
cat stdin/history_sample.log |node ../index.js 29 -s > stdout/single-record.out

# apt-argument list output format
cat stdin/history_sample.log |node ../index.js 29 Install --as-apt-arguments -s > stdout/as-apt-arguments.out

# multiple property list
cat stdin/history_sample.log |node ../index.js Start-Date,End-Date -s > stdout/multiple-list.out

# Properly handle --from 0
cat stdin/history_sample.log |node ../index.js --from 0 --limit 1 -s > stdout/from-zero.out

# --input
node ../index.js --input stdin/history_sample.log --from 0 --limit 1 > stdout/specify-input.out

# Done! Show test result deviations
git diff ./stdout

# Tidy up
cd -