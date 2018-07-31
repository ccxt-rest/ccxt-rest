FROM node:10.4.0-alpine as builder

LABEL authors="Franz See <franz@see.net.ph>"

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh alpine-sdk python
RUN npm install -g ccxt-rest@0.0.4 --unsafe-perm

FROM node:10.4.0-alpine
COPY --from=builder /usr/local/lib /usr/local/lib
RUN ln -s /usr/local/lib/node_modules/ccxt-rest/bin/www /usr/local/bin/ccxt-rest

ENV PORT 3000

EXPOSE 3000

CMD ["ccxt-rest"]
