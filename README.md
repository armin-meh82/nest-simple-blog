# Nest Simple Blog

A RESTful social media feed API built with NestJS, TypeScript, Prisma ORM, PostgreSQL, and Redis.

## Features

- User registration and login
- JWT authentication with access and refresh tokens
- Access token renewal using a refresh token
- Create, update, and delete posts
- Paginated social media feed
- Comments and nested replies
- User profiles and activity information
- Redis caching and feed cache invalidation
- Rate limiting for post creation
- Request validation
- Swagger API documentation
- Dockerized application, PostgreSQL, and Redis

## Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching and rate limiting:** Redis
- **Authentication:** JWT
- **Documentation:** Swagger
- **Containerization:** Docker and Docker Compose

## Requirements

- Docker Desktop or Docker Engine with Docker Compose
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/armin-meh82/nest-simple-blog.git
cd nest-simple-blog
```

### 2. Configure environment variables

Create a `.env` file in the project root. Use the following template and replace the JWT secrets with strong random values.

```env
DATABASE_URL=

POSTGRES_USERNAME=
POSTGRES_PASSWORD=
DB_NAME=

JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=

SERVER_PORT=

REDIS_URL=
```

### 3. Start the application

```bash
docker compose up --build -d
```

Docker Compose starts the API, PostgreSQL, and Redis. The API applies pending Prisma migrations before starting.

### 4. Access the API

- **API:** http://localhost:3000
- **Swagger:** http://localhost:3000/docs

### 5. View logs

```bash
docker compose logs -f api
```

### 6. Stop the application

```bash
docker compose down
```

To stop the services and remove their persistent database and Redis data, run:

```bash
docker compose down -v
```

**Warning:** The `-v` option permanently deletes the data stored in the Compose volumes.

## Development

To run the application outside Docker, install dependencies and ensure PostgreSQL and Redis are running locally.

```bash
npm i
npx prisma generate
npm run start:dev
```

Create and apply Prisma migrations in development using:

```bash
npx prisma migrate dev --name init
```

Commit the generated migration files so Docker deployments can apply them.

## License

This project is intended for learning and portfolio purposes.
