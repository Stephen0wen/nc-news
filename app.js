const express = require("express");
const apiRouter = require("./Routes/api.router");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use((request, response, next) => {
    response.status(404).send({ msg: "Path not found" });
});

app.use((error, request, response, next) => {
    if (error.status && error.msg) {
        response.status(error.status).send({ msg: error.msg });
    }
    next(error);
});

app.use((error, request, response, next) => {
    if (error.code === "22P02") {
        response.status(400).send({ msg: "Invalid Request" });
    }
});

module.exports = app;
