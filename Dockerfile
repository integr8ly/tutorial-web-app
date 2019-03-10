FROM registry.access.redhat.com/rhoar-nodejs/nodejs-10

EXPOSE 5001

ENV BUILD_ENV=OCP
ENV GIT_COMMITTER_NAME=integreatly
ENV GIT_COMMITTER_EMAIL=integreatly@redhat.com
ENV GIT_TERMINAL_PROMPT=0

USER default

COPY . ./

USER root

RUN chmod g+w yarn.lock

RUN chmod -R g+w src/styles

USER default

RUN npm i -g yarn && yarn install --pure-lockfile && yarn build

CMD ["npm", "start"]
