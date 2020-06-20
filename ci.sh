export NODE_ENV=ci

cd poks-server
npm install
npm test
npm run build
npm run start &

cd ../poks-client
npm install
npm test:unit

npm run start &
npm run test:int
