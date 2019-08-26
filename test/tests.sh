#!/bin/bash
cat stdin/history_sample.log |node ../index.js > stdout/no-args.out
cat stdin/history_sample.log |node ../index.js from 1 > stdout/first.out
cat stdin/history_sample.log |node ../index.js --last 2 > stdout/last-2.out
echo "Nice. Now run 'git diff' for deviations"