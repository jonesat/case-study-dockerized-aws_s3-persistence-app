FROM node:lts

COPY app/ /usr/src/app/

WORKDIR /usr/src/app

RUN npm install

EXPOSE 3000

CMD ["npm","start"]