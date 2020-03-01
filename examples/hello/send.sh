#!/usr/bin/env bash

## Note that `--form` implies POST method and `multipart/form-data`
## content-type.

curl --url http://localhost:3300/sendmail  \
     --form metadata=@_metadata.json       \
     --form templatemjm=@_template.mjm.hbs \
     --form templatetxt=@_template.txt.hbs \
     --form attachments=@attachment1.txt   \
     --form attachments=@attachment2.html
