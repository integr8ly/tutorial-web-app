#!/bin/sh

APP_NAME=tutorial-web-app

IMAGE_MASTER_TAG=quay.io/integreatly/$APP_NAME:master

docker login --username $REGISTRY_USERNAME --password $REGISTRY_PASSWORD $REGISTRY_HOST
docker push $IMAGE_MASTER_TAG
