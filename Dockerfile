FROM bucharestgold/centos7-s2i-nodejs:10.x

EXPOSE 5001

ENV BUILD_ENV=OCP

USER default

COPY . ./

USER root

RUN chmod g+w yarn.lock 

RUN chmod -R g+w src/styles

USER default

RUN npm i -g yarn && yarn install && yarn build

CMD ["npm", "start"]
