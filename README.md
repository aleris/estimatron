## Tests
Run single test:

    `npm test -- -t 'Server bet'`

## SSL

generate self signed cert:
    
    `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365`

go to https://localhost:29087/_admin/status and accept cert so wss also works
