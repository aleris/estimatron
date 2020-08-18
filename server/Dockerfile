FROM ubuntu:20.04 AS release

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# certbot
RUN apt-get install -y software-properties-common
RUN add-apt-repository universe
RUN apt-get update
RUN apt-get install -y certbot
RUN mkdir -p /etc/letsencrypt/renewal-hooks/pre/
RUN mkdir -p /etc/letsencrypt/renewal-hooks/post/
RUN mkdir -p /etc/letsencrypt/live/estimatron
RUN chmod 0755 /etc/letsencrypt/live/estimatron
RUN sh -c 'printf "#!/bin/sh\nkillall node\n" > /etc/letsencrypt/renewal-hooks/pre/estimatron-server.sh'
RUN sh -c 'printf "#!/bin/sh\nnode /opt/estimatron-server/.\n" > /etc/letsencrypt/renewal-hooks/post/estimatron-server.sh'
RUN chmod 755 /etc/letsencrypt/renewal-hooks/pre/estimatron-server.sh
RUN chmod 755 /etc/letsencrypt/renewal-hooks/post/estimatron-server.sh
#RUN certbot certonly --standalone --non-interactive --agree-tos -d estimatron.dev -m estimatron.dev@gmail.com --dry-run

# testing certificates (for testing the script locally purpose), will be overriden at startup by certbot
COPY cert/cert.pem /etc/letsencrypt/live/estimatron/fullchain.pem
COPY cert/key.pem /etc/letsencrypt/live/estimatron/privkey.pem

# estimatron-server
RUN mkdir /opt/estimatron-server

WORKDIR /opt/estimatron-server

COPY package*.json ./

# workaround to get uWebSockets.js from docker build because of how is distributed
COPY node_modules/uWebSockets.js ./node_modules/uWebSockets.js/

RUN npm install && npm cache clean --force --loglevel=error

COPY ./google-creds-*.json /etc/estimatron-server/

COPY . .

RUN rm -f google-creds-*.json

RUN npm run build

EXPOSE 44443

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD [ "node", "."]
