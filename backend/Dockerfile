FROM node:20-slim

WORKDIR /app

COPY package*.json ./

# Systempakete aktualisieren + npm-Abhängigkeiten sicher installieren
RUN apt-get update && apt-get upgrade -y && apt-get clean \
    && npm ci \
    && npm audit fix --force \
    && npm cache clean --force

COPY . .

EXPOSE 5000
CMD ["npm", "start"]
