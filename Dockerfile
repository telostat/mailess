FROM node:12.18.3-alpine as build

WORKDIR /usr/src/app

COPY src ./src
COPY package.json tsconfig.json webpack.config.js ./
RUN yarn install && yarn build

FROM mhart/alpine-node:slim-12.18.3

WORKDIR /app

COPY --from=build /usr/src/app/dist/index.js index.js

EXPOSE 3300
CMD [ "node", "--no-deprecation", "./index.js"]
