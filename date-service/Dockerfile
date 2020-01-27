FROM node:10-alpine

COPY package*.json ./
RUN npm install
RUN npm install pm2@latest -g
COPY . .

EXPOSE 3001

CMD [ "pm2-runtime", "start", "date-service.js" ]
