# Northcoders News API

## Setup Instructions

In order to run this repo lacally, after cloning it you must navigate into the be-nc-news directory and then install any missing dependencies using the following:

```
npm install
```

It is then necessary to create .env files containing the database names (in the smae directory). Below are some commands you can run to create these for you:

```
echo "PGDATABASE=nc_news" >> .env.development
echo "PGDATABASE=nc_news_test" >> .env.test
```

It will then be possible to create the databases by running the setup-dbs script (which runs the setup.sql file) using the following command:

```
npm run setup-dbs
```

---

## Running Integration Tests

Integration tests can be run using the following command:

```
npm test integration.test.js
```

The tests can be seen in the be-nc-news/\_\_tests\_\_/integration.test.js file. Tests can be run individually by inserting ".only" after the relevent test function (and then running the file using the command above):

```
test.only("GET:200...", () => {
    ...
})
```

Similarly, all the tests for a given endpoint can be run by inserting ".only" after the relevent "describe" function:

```
describe.only("/path/you/wish/to/test", () => {
    tests...
})
```

In the same way, test/describe blocks can be skipped by inserting ".skip" instead of ".only" in the same positions detailed above.

---

## Seeding Development Database and Listening

The development database can be seeded by running the seed script using the following command:

```
npm run seed
```

To start listening, the following command can be used to run the listen.js file:

```
node listen.js
```

Requests can then be made tothe server using insomnia/postman etc.
