FROM node:6.0

RUN mkdir -p /app/src
RUN mkdir -p /app/install

COPY package.json /app/install
WORKDIR /app/install
RUN npm install
ENV NODE_PATH=/app/install/node_modules

COPY . /app/src
WORKDIR /app/src
RUN npm install -g sequelize-cli
RUN npm install -g nodemon
