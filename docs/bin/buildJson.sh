#!/usr/bin/env bash

## declare walkthrough variable
declare -a arr=("0" "1" "1A" "2")
destDir="../../public/steelthreads/json/en"

## loop through the walkthrough array
for i in "${arr[@]}"
do
  ./createAttrJson.sh $i > attr-$i.tmp
  ./insertAttrJson.sh $i  > thread-$i.tmp
   mv thread-$i.tmp $destDir/thread-$i.json
done
