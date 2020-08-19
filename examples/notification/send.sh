#!/usr/bin/env bash

## Note that `--form` implies POST method and `multipart/form-data`
## content-type.

curl --url http://localhost:3300/notification \
     --form metadata=@_metadata.json          \
     --form attachments=@attachment1.txt      \
     --form attachments=@attachment2.html
