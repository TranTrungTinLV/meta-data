FROM node:18-alpine AS development

WORKDIR /usr/src/modules

COPY package*.json ./

COPY pnpm*.yaml ./

# RUN npm install -g yarn

RUN yarn install

RUN npm install

RUN npm install --global nx@latest

RUN apk -U --no-cache add protobuf protobuf-dev

COPY . .

