const express = require("express");
const { apiRouter } = require("./Routes");
const {
    handleInvalidPath,
    handleCustomErrors,
    handlePsqlErrors,
} = require("./Errors");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use(handleInvalidPath);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

module.exports = app;
