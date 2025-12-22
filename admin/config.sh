#!/bin/sh

# Global Variables
configFolderPath="config"
envFileName=".env"
firebaseMessageingSW="firebase-messaging-sw.js"
option="$1"

# Set Environment Variables
if [ "$option" = "-d" ]; then

   environment="Development"
   environmentVariable='.development'
   sleep 1s

elif [ "$option" = "-b" ]; then
  
   environment="Beta"
   environmentVariable=".beta"
   sleep 1s

elif [ "$option" = "-p" ]; then

   environment="Production"
   environmentVariable=".production"
   sleep 1s

else

    echo "Command Not Found"
    echo "[-d Development] [-b Beta] [-p Production]"
    exit 1

fi

if [ -n "$environment" ]; then
    #Replace ENV File
    envPath="$configFolderPath/$envFileName$environmentVariable"
    cp $envPath .env

    #Replace firebase Messageing SW Path File
    firebaseMessageingSWPath="$configFolderPath/$firebaseMessageingSW$environmentVariable"
    cp $firebaseMessageingSWPath public/firebase-messaging-sw.js

    echo "Successfully Move to $environment Environment"
    exit 1
else
    echo "This script requires administrator privileges. Please run the script as an administrator and try again"
    exit 1
fi