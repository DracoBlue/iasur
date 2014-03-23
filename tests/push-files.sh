#!/bin/bash

BASE_URL=http://127.0.0.1:32457
./iasur_server.js $BASE_URL/ &
PID=$!
echo "- launched test server at $BASE_URL with pid $PID"
sleep 1

error_shutdown_server_and_exit() {
    echo $1 >&2
    kill -9 $PID
    exit 1
}

curl_request() {
    EXPECTED_STATUS_CODE=$1
    ACCEPT=$2
    shift
    shift

    RESPONSE_STATUS_CODE=`curl -v -H "Accept: $ACCEPT" -H 'Expect: ' -sS $* 2>&1 | grep '^< ' | head -n 1 | cut -f '3' -d ' '`

    if [ "$EXPECTED_STATUS_CODE" != "$RESPONSE_STATUS_CODE" ]
    then
        error_shutdown_server_and_exit "Invalid status code: expected $EXPECTED_STATUS_CODE, but received $RESPONSE_STATUS_CODE"
    fi

    return 0
}


echo "- push 2 files (html)"
curl_request 301 text/html -X POST -F first=@tests/fixtures/hans.txt -F second=@tests/fixtures/hans2.txt $BASE_URL/files
echo "- push zip file (html)"
curl_request 301 text/html -X POST -F file=@tests/fixtures/hans.zip $BASE_URL/zip-files
echo "- push 2 files (json)"
curl_request 201 application/json -X POST -F first=@tests/fixtures/hans.txt -F second=@tests/fixtures/hans2.txt $BASE_URL/files
echo "- push zip file (json)"
curl_request 201 application/json -X POST -F file=@tests/fixtures/hans.zip $BASE_URL/zip-files


RAW_CREATED_URL=`curl -v -H "Accept: application/json" -H 'Expect: ' -sS -X POST -F file=@tests/fixtures/hans.zip $BASE_URL/zip-files 2>&1 | grep -E '^< Location: ' | head -n 1 | cut -f '3' -d ' '`

# for unknown reason, at the end of the RAW_CREATED_URL is a control character,
# that's why we have to get the substring BEFORE this control character
# found on macosx with curl 7.33.0
CREATED_URL=`echo "${RAW_CREATED_URL:0:65}"`

curl_request 200 application/json -X GET $CREATED_URL

kill -9 $PID
echo "- killed server at pid $PID"
echo ""
