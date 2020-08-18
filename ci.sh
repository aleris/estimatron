export NODE_ENV=ci

cd server
npm install
npm run test
client_unit_test_result=$?
npm run build
npm run start &
server_node_pid=$!

cd ../client
npm install
npm run test:unit
server_unit_tests_result=$?
npm run build
npx http-server dist -p 9000 &
client_node_pid=$!

npm run test:int
integration_test_result=$?

kill $server_node_pid
kill $client_node_pid

if [[ $client_unit_test_result -eq 0 && $server_unit_tests_result -eq 0 && $integration_test_result -eq 0 ]]; then
    echo 'All tests OK'
else
    if [[ $client_unit_test_result -ne 0 ]]; then
        echo 'Client unit tests failed'
    fi
    if [[ $client_unit_test_result -ne 0 ]]; then
        echo 'Server unit tests failed'
    fi
    if [[ $client_unit_test_result -ne 0 ]]; then
        echo 'Integration tests failed'
    fi
fi
