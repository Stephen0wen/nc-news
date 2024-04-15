# Northcoders News API

## Setup Instructions

In order to run this repo lacally, after cloning it you must create .env files containing the database names. Below are some commands you can run (after navigating into the repo) to create these for you:

```
echo "PGDATABASE=nc_news" >> .env.development
echo "PGDATABASE=nc_news_test" >> .env.test
```

---

It will then be possible to create the databases using setup.sql file:

```
psql -f ./db/setup.sql
```

---
