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

```
oc new-project tutorial-web-app
find . | grep openshiftio | grep application | xargs -n 1 oc apply -f
oc new-app --template react-demo-app -p SOURCE_REPOSITORY_URL=https://github.com/priley86/integr8ly-prototype -p SOURCE_REPOSITORY_REF=development
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
