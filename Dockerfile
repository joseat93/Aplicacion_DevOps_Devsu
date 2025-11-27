# Imagen ligera
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

#Puerto 8000
EXPOSE 8000

# start
CMD ["npm", "start"]

