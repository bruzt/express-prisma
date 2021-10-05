# Postgres Dev

```
sudo docker run -d --rm \
    --name postgres-prisma \
    -e POSTGRES_USER=dbuser \
    -e POSTGRES_PASSWORD=F83ai8qD \
    -e POSTGRES_DB=prisma-dev \
    -p 5432:5432 \
    postgres:13.4
```

```
npm run migrate:dev
```

```
npx prisma studio
```

# Redis Dev

```
sudo docker run -d --rm \
    -p 6379:6379 \
    --name redis-cache \
    redis:6.2.5
```