FROM node:14-alpine AS build

RUN mkdir -p /tmp/poks/poks-client
RUN mkdir -p /tmp/poks/poks-server

WORKDIR /tmp/poks/poks-client

COPY ./poks-client/package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY ./poks-client .
COPY ./poks-server/src/model ../poks-server/src/model

RUN NODE_ENV=production npm run build


FROM node:14-alpine AS release

RUN mkdir /opt/poks-client

WORKDIR /opt/poks-client

COPY --from=build /tmp/poks/poks-client/dist ./

EXPOSE 80

CMD [ "npx", "http-server", "."]
