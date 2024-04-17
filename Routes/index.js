const topicsRouter = require("./topics.router");
const articlesRouter = require("./articles.router");
const commentsRouter = require("./comments.router");
const { getApi } = require("../Controllers/api.controller");
const apiRouter = require("express").Router();

apiRouter.route("/").get(getApi);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = { apiRouter, topicsRouter, articlesRouter, commentsRouter };
