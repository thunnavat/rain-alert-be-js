FROM node:latest
WORKDIR /usr/src/appy
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "dev" ]