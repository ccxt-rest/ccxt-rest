#FROM node:10.4.0-alpine as builder
FROM scardon/ruby-node-alpine:2.4 as builder

LABEL authors="Franz See <franz@see.net.ph>"

RUN apk update && apk upgrade
RUN apk add --no-cache bash git openssh alpine-sdk python
RUN apk add ruby ruby-dev
RUN gem install bundler --no-ri --no-rdoc
RUN gem install rake --no-ri --no-rdoc

COPY . /www

WORKDIR /www

RUN npm install
CMD ["sh"]
RUN npm pack

FROM node:10.4.0-alpine
COPY --from=builder /www/ccxt-rest-*.tgz /tmp/
RUN npm install -g /tmp/ccxt-rest-*.tgz --no-save
RUN rm /tmp/ccxt-rest-*.tgz

ENV PORT 3000

EXPOSE 3000

CMD ["ccxt-rest"]
