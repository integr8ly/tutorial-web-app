sourceDir="../modules/ROOT/pages/_partials/"
destDir="../../public/steelthreads/asciidocs/en/"

while read p; do
  # echo "$sourceDir$p"
  # create temp file to filter for verification tag
  echo "include::$p[tags=intro]">temp.adoc
  # pbase=`echo ${p%.*}`
  pbase=$(basename "$p" .adoc)
  echo $pbase
  # render filtered adoc and name with hyphen verification.adoc
  ./asciidoc-coalescer.rb --ATTRIBUTE=location=local ./temp.adoc > $destDir$pbase-intro.adoc
done <taskAll.txt

# tidy up 
rm temp.adoc

