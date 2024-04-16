const apiRouter = require("express").Router();
const { getApi, getTopics } = require("../Controllers/api.controller");
const { articlesRouter, commentsRouter } = require("./");

apiRouter.route("/").get(getApi);

apiRouter.route("/topics").get(getTopics);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
