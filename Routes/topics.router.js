const {
    getTopics,
    postTopic,
    deleteTopic,
} = require("../Controllers/topics.controller");
const topicsRouter = require("express").Router({ mergeParams: true });

topicsRouter.route("/").get(getTopics).post(postTopic);
topicsRouter.route("/:slug").delete(deleteTopic);

module.exports = topicsRouter;
