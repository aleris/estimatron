## Docker

Test both server and client builds in a docker configuration similar with production: 
    
    `docker-compose up -d --build`

This will build both docker images. The client image is for testing purpose only, as it is deployed directly in a
storage bucket. The image is build in the root context (`/poks` not `/poks/poks-client`) because it needs the model
files from server (`/poks-server/src/model`). This is why there is a `.dockerignore` file in root (see
`docker-compose.yml`).

## Tests
Run all tests, including integration tests:
    
`./ci.sh`

Run single test:

`npm test -- -t 'Server bet'`

Open Cypress:

Start server & client and then:

```
cd poks-client
./node_modules/.bin/cypress open
```

## SSL

generate self signed cert:
    
    `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`

go to https://localhost:29087/_admin/status and accept cert so wss also works
