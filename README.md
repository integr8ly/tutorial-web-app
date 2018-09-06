# tutorial-web-app

This web application provides the front door into the Inetgreatly initiative. It houses the various Tutorials (aka Steel Threads) as well as a dashboard of installed products/services.

# deployment

```
oc new-project integreatly-web-app
find . | grep openshiftio | grep application | xargs -n 1 oc apply -f
oc new-app --template react-demo-app -p SOURCE_REPOSITORY_URL=https://github.com/integr8ly/tutorial-web-app -p SOURCE_REPOSITORY_REF=architecture
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