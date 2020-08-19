# Estimatron

Immersive planning poker online tool that helps to build team consensus estimates
and facilitates discussions about user stories.

## Dev

1. To start the server open a terminal and type:

```
cd server
npm run dev
```

2. To start the client open another terminal and type:

```
cd client
npm run dev
```

3. Make sure the self signed test certificate from `/server/cert` is trusted for localhost
and then go to `https://localhost:9000`

## Tests
Run all tests, including integration tests:
    
`./ci.sh`

Run single test:

`cd server`
`npm test -- -t 'Server bet'`

Open Cypress:

1. Start server & client and then:

```
cd client
./node_modules/.bin/cypress open
```

## Docker production like test environment

Test both server and client builds in a docker configuration similar with production: 
    
    `docker-compose up -d --build`

This will build both server and client docker images. The client image is for testing purpose only, as it is deployed
directly in a storage bucket. The image is build in the root context (`/estimatron` not `/estimatron/client`) because
it needs the model files from server (`/server/src/model`). This is why there is a `.dockerignore` file in root (see
`docker-compose.yml`).

## Local WSS

Generate self signed cert:

```
openssl req \
    -nodes \
    -new \
    -x509 \
    -keyout estimatron.dev.key \
    -out estimatron.dev.cert \
    -subj "/C=RO/ST=GL/L=B/O=Intensive/OU=Software/CN=estimatron.dev/emailAddress=estimatron.dev@google.com" \
    -days 365
```

Make sure the browser accepts the certificate (chrome settings enable local certificates).
