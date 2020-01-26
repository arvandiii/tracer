FROM node:10-alpine

COPY package*.json ./
RUN npm install
RUN npm install pm2@latest -g
COPY . .


EXPOSE 3000

CMD [ "pm2-runtime", "start", "web-service.js" ]
