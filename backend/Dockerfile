FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /app/upload/images

EXPOSE 4000
CMD ["node", "index.js"]
