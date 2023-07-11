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

Build the app and run the development server:

```
yarn build
yarn start
```

Send an email:

```
cd examples/hello
bash send.sh
```

Check http://localhost:1080 for the incoming mail.

## Dependency Upgrades

To check the outdated dependencies:

```sh
ncu
```

To upgrade them:

```sh
ncu -u
```

## Testing

```
yarn test
```

## Production

Build the image:

```
docker build --no-cache . -t mailess
```

.. or using OpenFaaS:

```
docker build -f Dockerfile.openfaas --no-cache . -t mailess
```

Run the container:

```
docker run --rm --network host mailess
```

... and run examples:

```
cd examples/hello
bash send.sh
```

## Release Process

The release process is managed by [release-please](https://github.com/googleapis/release-please). Please refer to [release-please.yml](.github/workflows/release-please.yml).
