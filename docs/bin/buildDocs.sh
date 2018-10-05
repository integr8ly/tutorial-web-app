partialsdir=../modules/ROOT/pages/_partials
ls -1 -I "attributes*" -I "*.unused" $partialsdir/ > listAll.txt
ls -1 -I attributes* -I *.unused ../modules/ROOT/pages/_partials/task* > taskAll.txt

./createDocs.sh
./createIntro.sh
./createTopIntro.sh
./createVer.sh
./buildJson.sh