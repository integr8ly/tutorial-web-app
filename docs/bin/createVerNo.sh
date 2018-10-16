#!/usr/bin/env bash

sourceDir="../modules/ROOT/pages/_partials/"
destDir="../../public/steelthreads/asciidocs/en/"

while read p; do
  echo "$sourceDir$p"
  # create temp file to filter for verification tag
  echo "include::$sourceDir$p[tags=verificationNo]">temp.adoc
  pbase=`echo ${p%.*}`
  # render filtered adoc and name with hyphen verification.adoc
  ./asciidoc-coalescer.rb --ATTRIBUTE=location=local ./temp.adoc > $destDir$pbase-verification-no.adoc
done <listAll.txt

# tidy up 
rm temp.adoc
