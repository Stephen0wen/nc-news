const express = require("express");
const apiRouter = require("./Routes/api.router");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.use((request, response, next) => {
    response.status(404).send({ msg: "Path not found" });
});

module.exports = app;
