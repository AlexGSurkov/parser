#!/bin/bash

#
# Usage:
#
# * * * * * ($HOME/<script name>.sh; echo $? >&1) | xargs $HOME/slackCronAlert.sh "<script name>"
#

set -e

TASK_NAME="$1"
shift
TASK_OUTPUT="${@:1:$(($#-1))}"
EXIT_STATUS="${@: -1}"
ENV="${NODE_ENV:=development}"
INSTANCE="${NODE_ENV_PRODUCTION:-$ENV}"
HOOK_URL="https://hooks.slack.com/services/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"
DATA=$(cat <<EOF
  {
    "attachments": [
      {
        "color": "#ff0000",
        "pretext": "$INSTANCE\n",
        "text": "Crontask *\"$TASK_NAME\"* failed with exit status: *$EXIT_STATUS*!\n\nCrontask output:\n\n$TASK_OUTPUT"
      }
    ],
    "username": "crontask-bot",
    "icon_emoji": ":robot_face:",
    "channel": "#crontasks"
  }
EOF
)

if [ "$EXIT_STATUS" -ne "0" ]; then
  curl -X POST -H 'Content-type: application/json' -d "$DATA" "$HOOK_URL"
fi
