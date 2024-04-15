const express = require("express");
const api = require("./endpoints.json");
const { getTopics } = require("./Controllers/api.controller");

const app = express();
app.use(express.json());

app.get("/api", (request, response, next) => {
    response.status(200).send(api);
});

app.get("/api/topics", getTopics);

app.use((request, response, next) => {
    response.status(404).send({ msg: "Path not found" });
});

module.exports = app;
