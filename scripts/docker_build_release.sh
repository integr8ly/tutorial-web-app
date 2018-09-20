#!/bin/sh

RELEASE_TAG=$CIRCLE_TAG

docker build -t quay.io/integreatly/tutorial-web-app:$RELEASE_TAG .