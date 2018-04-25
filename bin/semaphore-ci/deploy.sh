#!/bin/bash

set -e

#
#
# Semaphore CI deployment script via ssh
#
#

#
# Input params validation
#
if [ -z "$DEPLOY_NODE_ENV" ]; then
  echo "Variable DEPLOY_NODE_ENV is not set!"
  exit 255
fi

if [ "$DEPLOY_NODE_ENV" == "production" ] && [ -z "$DEPLOY_NODE_ENV_PRODUCTION" ]; then
  echo "Variable DEPLOY_NODE_ENV_PRODUCTION is not set!"
  exit 255
fi

if [ -z "$DEPLOY_APP_FOLDER" ]; then
  echo "Variable DEPLOY_APP_FOLDER is not set!"
  exit 255
fi

if [ -z "$DEPLOY_PM2_JSON_CONFIG" ]; then
  echo "Variable DEPLOY_PM2_JSON_CONFIG is not set!"
  exit 255
fi

if [ -z "$DEPLOY_REMOTE_HOST_USER" ]; then
  echo "Variable DEPLOY_REMOTE_HOST_USER is not set!"
  exit 255
fi

if [ -z "$DEPLOY_REMOTE_HOST_DOMAIN" ]; then
  echo "Variable DEPLOY_REMOTE_HOST_DOMAIN is not set!"
  exit 255
fi

if [ -z "$DEPLOY_DATABASE_URL" ]; then
  echo "Variable DEPLOY_DATABASE_URL is not set!"
  exit 255
fi


#
#
# Code
#
#
echo "CI node version: $(node -v), CI working dir: $PWD"
#
# create archive from build
tar --exclude='./node_modules' -cvzf ~/build.tar.gz .
#
# copy to remote server in batch mode (no pass asking) and verbose messaging
scp -Bv -oStrictHostKeyChecking=no ~/build.tar.gz $DEPLOY_REMOTE_HOST_USER@$DEPLOY_REMOTE_HOST_DOMAIN:~
#
# clear dir, unpack and delete archive
# npm install and migrations
# PM2 restart and change node version
NODE_VERSION=$(ssh $DEPLOY_REMOTE_HOST_USER@$DEPLOY_REMOTE_HOST_DOMAIN "cat /home/$DEPLOY_REMOTE_HOST_USER/.nvm/alias/default")

ssh -oBatchMode=yes -oStrictHostKeyChecking=no -v $DEPLOY_REMOTE_HOST_USER@$DEPLOY_REMOTE_HOST_DOMAIN /bin/sh -e << SSHEOF
  export PATH="/home/$DEPLOY_REMOTE_HOST_USER/.nvm/versions/node/$NODE_VERSION/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
  export NODE_ENV="$DEPLOY_NODE_ENV"
  export NODE_ENV_PRODUCTION="$DEPLOY_NODE_ENV_PRODUCTION"
  export API_URL="http://$DEPLOY_REMOTE_HOST_DOMAIN/"
  export DATABASE_URL="$DEPLOY_DATABASE_URL"

  echo "$DEPLOY_NODE_ENV node version before npm install: \$(node -v)"

  rm -frd ~/apps/$DEPLOY_APP_FOLDER
  mkdir ~/apps/$DEPLOY_APP_FOLDER
  cd ~/apps/$DEPLOY_APP_FOLDER/
  tar -xvzf ~/build.tar.gz || exit 0
  rm -f ~/build.tar.gz

  npm install
  node_modules/mocha/bin/mocha test/unit/ESTests/ESTests.test.js -t 20000
  npm run build
  grunt db:migration:up
  grunt clean:dev
  grunt copy:dev

  if [ ! -f $DEPLOY_PM2_JSON_CONFIG.json ]; then
    echo "PM2 config file $DEPLOY_PM2_JSON_CONFIG.json not found!"
    exit 255
  fi

  pm2 stop all
  pm2 delete all
  pm2 start $DEPLOY_PM2_JSON_CONFIG.json
  pm2 save
  # changes node version
  pm2 update
  echo "$DEPLOY_NODE_ENV node version PM2 will use: \$(node -v)"
SSHEOF
