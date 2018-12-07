# tutorial-web-app

This web application provides the front door into the Inetgreatly initiative. It houses the various Tutorials (aka Steel Threads) as well as a dashboard of installed products/services.

# Local Development

First you need to clone the [walkthroughs repository](https://github.com/integr8ly/tutorial-web-app-walkthroughs) next to the tutorial web app:

```
git clone https://github.com/integr8ly/tutorial-web-app-walkthroughs.git
```

Then change to the webapp directory, install its dependencies and run the development server:

```
yarn install
yarn start:dev
```

The webapp will automatically open (http://localhost:3006) in your browser and watch for file changes.
When running locally, the available services list is mocked, and service urls set via env vars.

The webapp will also automatically load the walkthroughs from `../tutorial-web-app-walkthroughs/walkthroughs`.

# Local Development against existing Openshft
```
yarn install
OPENSHIFT_HOST={openshift_master_uri} SSO_ROUTE={sso_url} yarn start:dev
```
example command against PDS cluster
`OPENSHIFT_HOST=master.CITY.openshiftworkshop.com SSO_ROUTE=secure-sso-sso.apps.CITY.openshiftworkshop.com yarn start:dev`

# Local Development of Walkthroughs

This section describes how to set up the Webapp for Walkthrough authors. It is recommended to put your Walkthroughs in a separate directory that you
later publish on Github or another git hosting provider.

## Layout of your Walkthroughs directory

The recommended layout for a Walkthroughs directory consists of a subfolder named `walkthroughs` and two files:

```
.
└── walkthroughs
    ├── <Walkthrough ID>
    │   ├── images
    │   │   └── image.png
    │   ├── walkthrough.adoc
    │   └── walkthrough.json
    ├── 2-walkthrough-two-short-description
    └── 3-walkthrough-three-short-description
```

* `Walkthrough ID`: The Walkthrough ID will be used in the URL of the Tutorial Web App. It must be unique and should match `^[a-zA-Z0-9_].$`. 
* `walkthrough.adoc`: The main content of the Walkthrough in Asciidoc format. It is recommended to have all content in a single file. Please refer to the documentation of [Asciidoctor](https://asciidoctor.org/docs/what-is-asciidoc/) to learn more about Asciidoc.
* `walkthrough.json`: The Walkthrough manifest file. Currently contains information about Walkthrough extra dependencies.

## walkthrough.json format

The `walkthrough.json` file is used to describe extra dependencies of your walkthrough. At the moment this means either additional service instances or git repositories that your Walkthrough depends on. The basic file structure is:

```json
{
  "dependencies": {
    "repos": [],
    "serviceInstances": []
  }
}
```

### walkthrough.json: repos

You can specify repositories that will be created for Walkthrough users in the cluster's [Gitea](https://gitea.io/en-us/) instance. The repositories will only be created once a user starts a walkthrough. The format is:

```json
{
  "repoName": "<Repo Name in Gitea>",
  "cloneUrl": "<Optional: clone from external repo>"
}
```

### walkthrough.json: serviceInstances

You can also specify additional service dependencies that will allow the users of your Walkthrough to use those services. Please note that the Services have to be present on the cluster already. Adding a service dependency creates
a service instance that links that service to the user's Walkthrough project.

Services can expose routes and they will be made available to the Walkthrough as an attribute in the form of `route-<route name>-host`. The value of this attribute will be `<protocol>://<route>`.

```json
{
  "metadata": {
    "name": "<Service Name>",
    "labels": { "<Example Label Name>": "<Example Label Value>" }
  },
  "spec": {
    "clusterServiceClassExternalName": "<External Name of the ClusterServiceClass>",
    "clusterServicePlanExternalName": "default"
  }
}
```

## Importing your external Walkthroughs into the Webapp

Once you have the file structure in place you can import your Walkthrough into the Webapp for testing purposes. Inside the webapp root directory run:

```sh
WALKTHROUGH_LOCATIONS=<path/to/your/walkthrough/folder> yarn start:dev
```

This will start the Webapp in development mode and import your Walkthroughs. You can also locally test against a remote Openshift instance:

```sh
OPENSHIFT_HOST=<openshift master url> WALKTHROUGH_LOCATIONS=<path/to/your/walkthrough/folder> yarn start:dev
```

After you've made changes to your walkthrough you can restart the webapp server by typing `rs` into the terminal where the Webapp process is running and hitting return. Refresh your browser and your changes should be reflected.

## Importing external Walkthroughs from a git repository

You can also specify a git reference in the form of a URL in `WALKTHROUGH_LOCATIONS`. By default the repository will be cloned inside the temporary directory `/tmp` but you can override this using `TMP_DIR`. Every time the webapp starts it will create a fresh clone of the walkthrough repositories.

By default the master branch of the repository gets cloned. But you can specify a branch or tag by appending `#<branch or tag name>` to the URL, for example:

```
https://github.com/user/repo#branch-or-tag
```

# Developing Walkthroughs on Openshift

If you're a walkthrough developer and you are working against an the Webapp on an Openshift instance, you can point that instance to your custom Walkthrouhgs repository.

Open the `webapp` project on the cluster and within that project, open the `tutorial-web-app` deployment. Click `Edit` and switch to the `Environment` tab.

You should see an env var named `WALKTHROUGH_LOCATIONS`. Either replace it's value with your repository URL or add your repository (the separator is `,`).

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


# Running the tests

Tests are implemented using Jest, Enzyme, and Stylelint. Run them with:

```
yarn test
```

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
