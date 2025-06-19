FROM node:24.0.1 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

FROM node:24.0.1-slim AS production
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 9428

RUN  apt-get update && \
     apt-get install -y curl

CMD ["npm", "run", "start"]