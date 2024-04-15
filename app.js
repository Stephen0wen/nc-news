const express = require("express");
const { getTopics } = require("./Controllers/api.controller");

const app = express();
app.use(express.json());

app.get("/api/topics", getTopics);

app.use((request, response, next) => {
    response.status(404).send({ msg: "Path not found" });
});

module.exports = app;
