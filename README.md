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

# Documentation

This project requires [asciidoctor](https://asciidoctor.org/). It uses asciidoctor.js to render adoc files at runtime.

To write documentation for inclusion in the app, you only need to edit the files in the [pages](./docs/modules/ROOT/pages) directory.

After making edits, run the [buildDocs.sh](.docs/bin/buildDocs.sh) script.

Each walkthrough requires:

* master-<id>.adoc
* attributes-<id>.adoc
* task-<task>.adoc
* <step>.adoc (only if task consists of more than one step)


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
