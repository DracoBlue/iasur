#!/bin/bash

BASE_URL=http://127.0.0.1:32457
./iasur_server.js $BASE_URL &
PID=$!
echo "[ok] launched test server at $BASE_URL with pid $PID"
sleep 1
curl -H 'Expect: ' -sS -F file=@tests/fixtures/hans.zip -X POST $BASE_URL/zip-files && echo "[ok] pushed zip file"
curl -H 'Expect: ' -sS -F first=@tests/fixtures/hans.txt -F second=@tests/fixtures/hans2.txt -X POST $BASE_URL/files && echo "[ok] pushed 2 files"
kill -9 $PID
echo ""
