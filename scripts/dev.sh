#!/usr/bin/env bash
#
#
# Check if a container is running. Currently supporting the mockApi container
checkContainerRunning()
{
  local NAME=$1
  local CONTAINER=$2
  local COUNT=1
  local DURATION=10
  local DELAY=0.1

  printf "Check container running..."

  while [ $COUNT -le $DURATION ]; do
    sleep $DELAY
    (( COUNT++ ))
    if [ -z "$(docker ps | grep $CONTAINER)" ]; then
      break
    fi
  done

  if [ ! -z "$(docker ps | grep $CONTAINER)" ] && [ ! -z "$(docker ps | grep $NAME)" ]; then
    printf "${GREEN}Container SUCCESS"
    printf "\n\n${NOCOLOR}"
  else
    printf "${RED}Container ERROR"
    printf "\n\n  Error: ${RED}Check \"${NAME}\" with \"${CONTAINER}\""
    printf "${NOCOLOR}\n"
  fi
}
#
#
# Install & Run API Mock Container
#
devApi()
{
  local CONTAINER="cdcabrera/apidoc-mock:1.0.2"
  local NAME="patternfly-react-demo-dev"
  local PORT=$1
  local DIR=$2
  local UPDATE=$3
  local DATA_VOLUME="/app/data"

  docker stop -t 0 $NAME >/dev/null

  if [ -z "$(docker images | grep ^$CONTAINER' ')" ] || [ "$UPDATE" = true ]; then
    echo "Setting up development Docker API container"
    docker pull $CONTAINER
  fi

  if [ -z "$(docker ps | grep $CONTAINER)" ] && [ "$UPDATE" = false ]; then
    echo "Starting development API..."
    docker run -d --rm -p $PORT:8000 -v $DIR:$DATA_VOLUME --name $NAME $CONTAINER >/dev/null
  fi

  if [ "$UPDATE" = false ]; then
    checkContainerRunning $NAME $CONTAINER
  fi

  if [ ! -z "$(docker ps | grep $CONTAINER)" ] && [ "$UPDATE" = false ]; then
    echo "  Container: $(docker ps | grep $CONTAINER | cut -c 1-80)"
    echo "  Development API running: http://localhost:$PORT/docs"
    printf "  To stop: $ ${GREEN}docker stop ${NAME}${NOCOLOR}\n"
  fi
}
#
#
# main()
#
{
  RED="\e[31m"
  GREEN="\e[32m"
  NOCOLOR="\e[39m"
  PORT=8080
  DIR=""
  UPDATE=false

  while getopts p:d:u option;
    do
      case $option in
        p ) PORT=$OPTARG;;
        d ) DIR="$OPTARG";;
        u ) UPDATE=true;;
      esac
  done

  if [ -z "$(docker info | grep Containers)" ]; then
    exit 1
  fi

  devApi $PORT $DIR $UPDATE

  echo ""
}
