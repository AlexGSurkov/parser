#!/bin/bash

#
#
# Semaphore CI script runner (writes all output to file first)
#
#

#
# Validate input params
#
if [[ -z $* ]]; then
  echo "Nothing to run, use script_runner.sh <command> <param1> ... <paramN>"
  exit 255
fi

echo "Script is in progress, please wait few minutes..."

#
# Semaphore CI has problems with parsing big output data
# So need to redirect all data into file and check exit code
#
$@ &> ~/result.txt; SCRIPT_EXIT_CODE=$?
cat ~/result.txt
rm -f ~/result.txt
[ $SCRIPT_EXIT_CODE -eq 0 ] || exit $SCRIPT_EXIT_CODE
