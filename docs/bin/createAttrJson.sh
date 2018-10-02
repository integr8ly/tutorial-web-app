sourceDir="../modules/ROOT/pages/_partials/"
destDir="../../public/steelthreads/json/en/"



./asciidoc-coalescer.rb $sourceDir$1 > $destDir$1.


while IFS=':' read dummy var val
do
if [ "$var" ]
then
value="$(echo -e "${var}" | sed -e 's/^[[:space:]]*//')"
        echo \"$var\",\"$value\",
fi

done < $destDir$1

cat $destDir$1|jq -n -r ''
