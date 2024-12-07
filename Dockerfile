FROM alpine
WORKDIR /src
RUN apk add --update nodejs npm

COPY package*.json ./
COPY .env .env

RUN npm install

COPY . ./

RUN npm run build

EXPOSE 3000

CMD ["node", "build/app.js"]
