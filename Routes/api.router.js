const apiRouter = require("express").Router();
const { getApi, getTopics } = require("../Controllers/api.controller");
const articlesRouter = require("./articles.router");

apiRouter.route("/").get(getApi);

apiRouter.route("/topics").get(getTopics);

apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
