FROM node:24.0.1 AS build
ARG ENVIRONMENT=docker
WORKDIR /usr/local/app
COPY package*.json .
RUN npm install
COPY . . 
RUN npm run build:$ENVIRONMENT

FROM nginx:latest
COPY --from=build /usr/local/app/dist/front-end /usr/share/nginx/html 
COPY /nginx.conf etc/nginx/conf.d/default.conf
EXPOSE 80