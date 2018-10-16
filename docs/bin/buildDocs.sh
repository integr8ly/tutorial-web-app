#!/usr/bin/env bash
partialsdir=../modules/ROOT/pages/_partials
ls -1 $partialsdir/ | grep -v attributes | grep -v '.unused' > listAll.txt
ls -1 ../modules/ROOT/pages/_partials/task* | grep -v attributes | grep -v '.unused' > taskAll.txt

./createDocs.sh
./createIntro.sh
./createTopIntro.sh
./createVer.sh
./createVerNo.sh
./buildJson.sh
