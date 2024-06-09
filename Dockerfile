FROM node:20-alpine as production

WORKDIR /usr/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3003

CMD [ "yarn", "start" ]
# CMD nx serve gateway-service --configuration=production
