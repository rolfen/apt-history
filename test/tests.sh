#!/bin/bash
cat stdin/history_sample.log |node ../index.js > stdout/no-args.out
cat stdin/history_sample.log |node ../index.js from 1 > stdout/first.out
echo "Nice. Now run 'git diff' for deviations"