#!/usr/bin/env bash

sourceDir="../modules/ROOT/pages/_partials/"
destDir="../../public/steelthreads/asciidocs/en/"

while read p; do
  echo "$sourceDir$p"
  ./asciidoc-coalescer.rb $sourceDir$p > $destDir$p
done <listAll.txt


