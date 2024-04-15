const apiRouter = require("express").Router();
const { getApi, getTopics } = require("../Controllers/api.controller");

apiRouter.route("/").get(getApi);

apiRouter.route("/topics").get(getTopics);

module.exports = apiRouter;
