#!/bin/bash

cd /var/www/api/dist/

if pm2 list | grep -q "api"; then
  echo "App is already running. Restarting..."
  pm2 restart "api"
else
  echo "App is not running. Starting app..."
  pm2 start "index.js" --name "api"
fi

