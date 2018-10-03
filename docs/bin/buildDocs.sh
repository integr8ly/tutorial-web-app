ls -1 -I attributes* ../modules/ROOT/pages/_partials/ > listAll.txt
ls -1 -I attributes* ../modules/ROOT/pages/_partials/task* > taskAll.txt

./createDocs.sh
./createIntro.sh
./createVer.sh
./buildJson.sh