FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG DATABASE_URL
RUN DATABASE_URL="$DATABASE_URL"  npx prisma generate
RUN npm run build

EXPOSE 8001

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]