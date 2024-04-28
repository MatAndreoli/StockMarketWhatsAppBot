FROM debian:stable-slim

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    npm \
    chromium

ENV NVM_DIR=/usr/local/nvm \
    NODE_VERSION=20.12.2
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH=$NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules \
    PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD [ "npm", "start" ]
