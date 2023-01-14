FROM node:16

WORKDIR /app/chat_server

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .

CMD [ "npm", "run", "start" ]
