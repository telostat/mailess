# mailess

Send mail, less...

## Objective

For a request like this:

```
curl --request POST                               \
     --url http://localhost:3300/sendmail         \
     --user "user:password"                       \
     --header 'Content-Type: multipart/form-data' \
     --form files=@_template.hbs                  \
     --form files=@_metadata.json                 \
     --form files=@attachment1.xlsx               \
     --form files=@attachment2.docx               \
     --form files=@another_attachment2.pdf        \
     --form files=@another_attachment2.pdf
```

should return:

```
{
    "status": "SENT",
    "message-id": "<bojnjkFVRhCmnA_FiueGBQ@hebele.hubele.net>"
}
```

## Development

Run mailcatcher:

```
docker run --rm -p 1025:25 -p 1080:80 tophfr/mailcatcher:0.7.1
```

Run the development server:

```
MAILESS_USERNAME="u" MAILESS_PASSWORD="p" MAILESS_HOST="localhost" MAILESS_PORT="1025" yarn dev
```

Send an email:

```
cd examples/hello
bash send.sh
```

Check http://localhost:1080 for the incoming mail.

## Testing

```
MAILESS_USERNAME="u" MAILESS_PASSWORD="p" MAILESS_HOST="localhost" MAILESS_PORT="1025" yarn test
```

## Production

Duplicate the `.env_example` as `.env` file and fill it properly:

```
cp .env_example .env
```

Build the image:
```
docker build --no-cache . -t mailess
```

Run the container:

```
docker run --init --env-file .env -p 3300:3300 mailess:latest
```