FROM node:18-alpine as build

WORKDIR /usr/src/app

COPY src ./src
COPY package.json tsconfig.json webpack.config.js typedoc.json ./
RUN yarn install && yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /usr/src/app/dist/index.js index.js

EXPOSE 3300
CMD [ "node", "--no-deprecation", "./index.js"]
