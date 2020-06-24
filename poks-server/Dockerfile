FROM node:14-alpine AS build

RUN mkdir /temp/build/ && chown -R node:node /temp/build

WORKDIR /temp/build

COPY --chown=node:node package*.json ./

USER node

RUN npm install && npm cache clean --force --loglevel=error

FROM node:14-alpine AS release

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node --from=build /temp/build/dist ./

COPY --chown=node:node ./cert/* /etc/poks/
COPY --chown=node:node ./google-creds-*.json /etc/poks/

USER node

CMD [ "node", "."]
