const express = require("express");
const { apiRouter } = require("./Routes");
const {
    handleInvalidPath,
    handleCustomErrors,
    handlePsqlErrors,
    handleAuthErrors,
} = require("./Errors");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(handleInvalidPath);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

app.use(handleAuthErrors);

module.exports = app;
