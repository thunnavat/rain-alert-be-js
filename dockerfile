FROM node:latest
WORKDIR /usr/src/appy
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "dev" ]