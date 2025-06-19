FROM node:24.0.1 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG ENVIRONMENT=production
RUN npm run build:${ENVIRONMENT}

FROM nginx:alpine AS production
COPY --from=builder --chown=nginx:nginx /app/dist/front-end /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache curl

EXPOSE 80