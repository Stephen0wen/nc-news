const commentsRouter = require("express").Router({ mergeParams: true });
const { deleteComment } = require("../Controllers/comments.controller");

commentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commentsRouter;
