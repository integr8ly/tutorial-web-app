#!/usr/bin/env bash

# usage:
# insertAttrJson.sh <walkthrough-id>

sourceFile="./attr-$1.tmp"
destDir="../../public/steelthreads/json/en"

jq -M -s -f ./insertAttrJson.jq $sourceFile $destDir/thread-$1.json
