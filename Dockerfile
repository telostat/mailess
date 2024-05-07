FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY src ./src
COPY package.json tsconfig.json webpack.config.js typedoc.json ./
RUN npm install && npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /usr/src/app/dist/index.js index.js

EXPOSE 3300
CMD [ "node", "--no-deprecation", "./index.js"]
