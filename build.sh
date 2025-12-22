#!/bin/sh

echo "**************************"
echo "*** Deployment Started ***"
echo "**************************"

## Git Reset Hard

git reset --hard

echo "**************************"

## Git pull

git pull

echo "**************************"

## Move to Production Environment

sh config.sh -p

echo "**************************"

## Npm install

npm install

echo "**************************"

## PM2 Restart all

pm2 restart all

echo "**************************"
sleep 2s
curl http://127.0.0.1:4000
echo "!!! Build Generated Successfully !!!"