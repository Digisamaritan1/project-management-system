#!/bin/sh

CONFIG_FOLDER_PATH="environment"

FIREBASESDKFILE="firebase-adminsdk.json"
ENVFILE=".env"

case "$1" in
   "-d") 
    ENVIRONMENT="Development"
    ENVIRONMENTVAR="dev-"
    sleep 1s
   ;;
   "-t") 
    ENVIRONMENT="Testing"
    ENVIRONMENTVAR="test-"
    sleep 1s
   ;;
   "-p") 
    ENVIRONMENT="Production"
    ENVIRONMENTVAR="prod-"
    sleep 1s
    echo ""
    echo "!!!! Project Environment MOVE TO PRODUCTION. Be Careful !!!!"
    echo ""
    sleep 1s
   ;;
   *)
    echo "Command Not Found"
    echo "[-d Development] [-t Testing] [-p Production]"
   ;;
esac

FIREBASESDKFILE="$CONFIG_FOLDER_PATH/$ENVIRONMENTVAR$FIREBASESDKFILE"
ENV="$CONFIG_FOLDER_PATH/$ENVIRONMENTVAR$ENVFILE"

cp $FIREBASESDKFILE firebase-adminsdk.json
cp $ENV .env

echo "!!!! Successfully Move to $ENVIRONMENT Environment !!!!"