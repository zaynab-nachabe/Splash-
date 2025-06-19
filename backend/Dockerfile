FROM node:24.0.1 AS build
WORKDIR  /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 9428
CMD [ "npm", "run", "start"]