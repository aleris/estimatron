export NODE_ENV=ci

cd poks-server
npm install
npm test
npm run build
npm run start &
server_node_pid=$!

cd ../poks-client
npm install
npm test:unit
npm run build
npx http-server dist -p 9000 &
client_node_pid=$!

npm run test:int

kill $server_node_pid
kill $client_node_pid
