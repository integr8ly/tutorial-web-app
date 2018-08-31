FROM bucharestgold/centos7-s2i-nodejs:10.x

EXPOSE 8000

USER root

COPY . ./

USER default

ENV BUILD_ENV=OCP

RUN scl enable rh-nodejs8 "npm i -g yarn && yarn install && yarn build"

CMD ["npm", "start"]