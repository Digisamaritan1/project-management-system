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
    sleep 2s

    # Prompt the user for confirmation
    echo "!!!! By Hitting this Command Project Environment is move to Production !!!!"
    read -p "Do you want to proceedC? (Y/N)" confirm

    # Check if the user entered "Y" or "y" to confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then

        sleep 1s
        echo ""
        echo "!!!! Project Environment is MOVING TO PRODUCTION. Be Careful !!!!"
        echo ""
        sleep 1s

        ## Fatch ENV File
        rm -rf $configFolderPath/git
        git clone https://github.com/aliansoftwareteam/alianhub-production-configurations.git $configFolderPath/temp
        mv $configFolderPath/temp/.env.production $configFolderPath/.env.production
        mv $configFolderPath/temp/firebase-messaging-sw.js.production $configFolderPath/firebase-messaging-sw.js.production
        rm -rf $configFolderPath/temp

    else
        exit 1
    fi

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