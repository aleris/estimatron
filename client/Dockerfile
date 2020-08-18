FROM node:14-alpine AS build

RUN mkdir -p /tmp/estimatron/client
RUN mkdir -p /tmp/estimatron/server

WORKDIR /tmp/estimatron/client

COPY ./client/package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY ./client .
COPY ./server/src/model ../server/src/model

RUN NODE_ENV=production npm run build


FROM node:14-alpine AS release

RUN mkdir /opt/client

WORKDIR /opt/client

COPY --from=build /tmp/estimatron/client/dist ./

EXPOSE 80

CMD [ "npx", "http-server", "."]
