FROM node:14

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn 

COPY . .
COPY .env.production .env

RUN yarn build

ENV NODE_ENV prod
ENV PORT=8080

EXPOSE 8080

CMD ["node", "build/index.js"]