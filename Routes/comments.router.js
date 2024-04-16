const { deleteComment } = require("../Controllers/comments.controller");
const commentsRouter = require("express").Router({ mergeParams: true });

commentsRouter.route("/:comment_id").delete(deleteComment);

module.exports = commentsRouter;
