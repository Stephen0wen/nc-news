const express = require("express");
const { apiRouter } = require("./Routes");
const {
    handleInvalidPath,
    handleCustomErrors,
    handlePsqlErrors,
} = require("./Errors");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use(handleInvalidPath);

app.use(handleCustomErrors);

app.use(handlePsqlErrors);

module.exports = app;
