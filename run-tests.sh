#!/bin/bash

curl -H 'Expect: ' -v -sS -F file=@tests/fixtures/hans.zip -X POST http://127.0.0.1:1337/zip-files && echo ""
curl -H 'Expect: ' -v -sS -F first=@tests/fixtures/hans.txt -F second=@tests/fixtures/hans2.txt -X POST http://127.0.0.1:1337/files && echo ""

echo ""
