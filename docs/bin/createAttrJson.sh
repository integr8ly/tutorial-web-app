# usage:
# createAttrJson.sh <walkthrough-id>

sourceFile="../modules/ROOT/pages/_partials/attributes-$1.adoc"
destDir="../../public/steelthreads/json/en/"



./asciidoc-coalescer.rb $sourceFile > $destDir$1.tmp

echo {

while IFS=':' read dummy var val
do
if [ "$var" ]
then
value="$(echo -e "${val}" | sed -e 's/^[[:space:]]*//')"
        echo \"$var\":\"$value\",
fi

done < $destDir$1.tmp

echo \"dummy\":\"value\"

echo }
