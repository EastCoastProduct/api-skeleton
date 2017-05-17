FROM node:6.7

RUN useradd --user-group --create-home --shell /bin/bash app \
  && npm install -g --silent sequelize-cli nodemon gulp \
  && mkdir /home/app/src

COPY . /home/app/src
WORKDIR /home/app/src
