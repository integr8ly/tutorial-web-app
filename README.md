# tutorial-web-app

This web application provides the front door into the Inetgreatly initiative. It houses the various Tutorials (aka Steel Threads) as well as a dashboard of installed products/services.

# Local Development

```
yarn install
yarn start:dev
```

The webapp will automatically open (http://localhost:3006) in your browser and watch for file changes.
When running locally, the available services list is mocked, and service urls set via env vars.

# Deployment to OpenShift (Remote Development Setup)

A git reference can be deployed to a remote OpenShift cluster.

```
cd deployment
./create_webapp.sh openshift.example.com:8443 webapp-001 development
```

NOTE: The cluster must be setup for cors manually. This requires adding the webapp route to the `corsAllowedOrigins` block in master-config.yml.

To rebuild & redeploy:

```
oc start-build -n webapp-001 tutorial-web-app
```

# Deployment to OpenShift (Non-Development Setup)

When deploying to OpenShift, services and their urls are retrived from the OpenShift cluster.

To deploy, first export a variable set to the host of your OpenShift master.
For example:

```
export OPENSHIFT_HOST=openshift.example.com:8443
```

Import the template and initialise it.

```
oc new-project tutorial-web-app
oc apply -f deployment/openshift-template.yml
oc new-app --template tutorial-web-app -p OPENSHIFT_HOST=$OPENSHIFT_HOST
```

For other parameters that you may want to change, check the template.

You will also need to create an OAuthClient. This will require cluster-admin privileges.

```
export WEBAPP_HOST=`oc get route tutorial-web-app -n tutorial-web-app --template '{{.spec.host}}'`
oc create -f deployment/openshift-oauthclient.yml
oc patch oauthclient tutorial-web-app -p "{\"redirectURIs\":[\"https://$WEBAPP_HOST\"]}"
```

# Ascii Doc Support

This project requires [asciidoctor](https://github.com/asciidoctor/asciidoctor) and [yq](https://github.com/kislyuk/yq) for translating Ascii Docs to JSON.

Pre-requisites:

```
brew install asciidoctor
brew install python-yq
```

To convert ascii doc to HTML fragments, run the following:

```
cd ./public/asciidocs/en
asciidoctor [INPUT-ASCII-DOC-FILE] -s
```

To convert ascii doc files to JSON, you can run the following:

```
cd ./public/asciidocs/en
asciidoctor -b docbook [INPUT-ASCII-DOC-FILE] [OUTPUT-XML-FILE]
xq . [OUTPUT-XML-FILE] > [OUTPUT-JSON-FILE]
```

This JSON can then be referenced in the appropriate language locale under `public/locales/*.json`.


# Releasing

To do a release of the webapp, update the version in package.json

```
npm version x.y.z
git tag x.y.z
```

Push the changes (including the version tag) to the repo

```
git push origin master
git push --tags
```

This will trigger a new release build.
If the build is successful, a new image will be pushed to https://quay.io/repository/integreatly/tutorial-web-app.
The new image will be tagged as `latest` and the version number `x.y.z`.

TODO: Installing a released version of the webapp to OpenShift
