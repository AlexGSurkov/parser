#!/bin/bash

set -eo pipefail

export NODE_NO_WARNINGS=1

USER="$(basename "$HOME")"
PID_FILE="/tmp/${USER}_syncresources.pid"
TASK_DIR="$(cd "$(dirname "$(dirname "$(readlink -fm "$0")")")" && pwd)"

echo "task dir: $TASK_DIR  /  "

if [ -f "$PID_FILE" ]; then
  pid=`cat $PID_FILE`
  echo "existing pid: $pid  /  "
  if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
    echo "Sync is running ($pid)  /  "
    exit 0
  fi
fi

echo "new pid: $$  /  "
echo "$$" > "$PID_FILE"
cd "$TASK_DIR"
echo "~~~ START GRUNT ~~~  /  "
grunt syncResources | xargs -I {} echo {} "  /  "
echo "~~~ END GRUNT ~~~"
rm -f "$PID_FILE"
