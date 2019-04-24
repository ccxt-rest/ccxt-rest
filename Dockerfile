FROM scardon/ruby-node-alpine:2.4.4 as builder

LABEL authors="Franz See <franz@see.net.ph>"

RUN apk add --no-cache bash git openssh alpine-sdk python

COPY . /www

WORKDIR /www

RUN npm install
RUN npm pack

# 10.15.3 - LTS
FROM node:10.15.3-alpine
COPY --from=builder /www/ccxt-rest-*.tgz /tmp/
RUN apk add ncurses alpine-sdk python
RUN npm install -g /tmp/ccxt-rest-*.tgz --python=`which python` --no-save --unsafe-perm=true --allow-root
RUN rm /tmp/ccxt-rest-*.tgz

ENV PORT 3000

EXPOSE 3000

CMD ["ccxt-rest"]
