#!/bin/sh

APP_NAME=tutorial-web-app

RELEASE_TAG=$CIRCLE_TAG

IMAGE_LATEST_TAG=quay.io/integreatly/$APP_NAME:latest
IMAGE_RELEASE_TAG=quay.io/integreatly/$APP_NAME:$RELEASE_TAG

docker login --username $REGISTRY_USERNAME --password $REGISTRY_PASSWORD $REGISTRY_HOST
docker tag $IMAGE_RELEASE_TAG $IMAGE_LATEST_TAG
docker push $IMAGE_LATEST_TAG
docker push $IMAGE_RELEASE_TAG
