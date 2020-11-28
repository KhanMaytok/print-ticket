FROM ubuntu:20.04

RUN apt update && apt -y upgrade && \
  apt install -y python3-pip
    
WORKDIR /usr/src/app

COPY package.json .

RUN npm i cups nodemon node-gyp -g

RUN npm install

COPY . .
