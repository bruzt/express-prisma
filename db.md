# Postgres 

## Dev

```
sudo docker run -d --rm \
    --name postgres-prisma-dev \
    -e POSTGRES_USER=dbuser \
    -e POSTGRES_PASSWORD=F83ai8qD \
    -e POSTGRES_DB=prisma-dev \
    -p 5432:5432 \
    postgres:13.4
```

```
npm run dev:migrate
```

```
npm run dev:studio
```

## Test

```
sudo docker run -d --rm \
    --name postgres-prisma-test \
    -e POSTGRES_USER=dbuser \
    -e POSTGRES_PASSWORD=F83ai8qD \
    -e POSTGRES_DB=prisma-test \
    -p 5433:5432 \
    postgres:13.4
```

# Redis

## Dev

```
sudo docker run -d --rm \
    -p 6379:6379 \
    --name redis-cache-dev \
    redis:6.2.5
```

## Test

```
sudo docker run -d --rm \
    -p 6380:6379 \
    --name redis-cache-test \
    redis:6.2.5
```