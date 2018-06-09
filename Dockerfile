FROM node:10.4.0-alpine

LABEL authors="Franz See <franz@see.net.ph>"

WORKDIR /www

COPY package*.json /www/
RUN cd /www; npm install

COPY . /www

ENV PORT 3000

EXPOSE 3000

CMD ["npm", "start"]
