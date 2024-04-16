const { getTopics } = require("../Controllers/topics.controller");
const topicsRouter = require("express").Router({ mergeParams: true });

topicsRouter.route("/").get(getTopics);

module.exports = topicsRouter;
