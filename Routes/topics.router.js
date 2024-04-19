const { getTopics, postTopic } = require("../Controllers/topics.controller");
const topicsRouter = require("express").Router({ mergeParams: true });

topicsRouter.route("/").get(getTopics).post(postTopic);

module.exports = topicsRouter;
