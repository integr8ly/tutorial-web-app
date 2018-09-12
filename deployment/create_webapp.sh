#!/bin/bash

set -x
set -e

if [ $# -ne 3 ]; then
    echo 'Must specify openshift host, namespace & git ref to deploy e.g. ./create_webapp.sh openshift.example.com:8443 webapp-test-001 development'
    exit 1
fi

echo $@

OPENSHIFT_HOST=$1
NAMESPACE=$2
SOURCE_REPOSITORY_REF=$3
MAIN_TEMPLATE="${MAIN_TEMPLATE:-./openshift-template.yml}"
SOURCE_BUILDING_TEMPLATE="${SOURCE_BUILDING_TEMPLATE-./source-building-template.yml}"
SOURCE_BUILDING_PATCH="${SOURCE_BUILDING_PATCH-./source-building-deploymentconfig-patch.yml}"
TMP_MAIN_TEMPLATE_FILE=/tmp/processed_main_template.yml
TMP_SOURCE_BUILDING_TEMPLATE_FILE=/tmp/processed_source_building_template.yml
OC_CMD="${OC_CMD:-oc}"

# Create webapp deployment, route & svc
$OC_CMD new-project $NAMESPACE
$OC_CMD process -n $NAMESPACE -f $MAIN_TEMPLATE --param=OPENSHIFT_HOST=$OPENSHIFT_HOST > $TMP_MAIN_TEMPLATE_FILE
$OC_CMD create -n $NAMESPACE -f $TMP_MAIN_TEMPLATE_FILE

# Create an imagestream & buildconfig for building & pushing from the git repo at the specified branch/tag/ref
$OC_CMD process -n $NAMESPACE -f $SOURCE_BUILDING_TEMPLATE --param=SOURCE_REPOSITORY_REF=$SOURCE_REPOSITORY_REF > $TMP_SOURCE_BUILDING_TEMPLATE_FILE
$OC_CMD create -n $NAMESPACE -f $TMP_SOURCE_BUILDING_TEMPLATE_FILE

# Patch the deployment to use the imagestream
$OC_CMD patch -n $NAMESPACE deploymentconfig/tutorial-web-app --patch "$(cat $SOURCE_BUILDING_PATCH)"

# Patch the oauthclient to allow redirects to this webapp's route
WEBAPP_HOST=$($OC_CMD -n $NAMESPACE get route tutorial-web-app --template "{{.spec.host}}")
$OC_CMD patch oauthclient/tutorial-web-app --patch "{\"redirectURIs\":[\"https://$WEBAPP_HOST\"]}"

# We can't patch the corsAllowedOrigins on the master-config using an oc command, so that has to be done manually
# e.g. add the route to the corsAllowedOrigins block in master-config.yml and restart

# Kick off a build
$OC_CMD start-build -n $NAMESPACE tutorial-web-app
