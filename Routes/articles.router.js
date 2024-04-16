const articlesRouter = require("express").Router({ mergeParams: true });
const {
    getArticles,
    getArticle,
    getCommentsByArticle,
} = require("../Controllers/articles.controller");

articlesRouter.route("/").get(getArticles);

articlesRouter.route("/:article_id").get(getArticle);

articlesRouter.route("/:article_id/comments").get(getCommentsByArticle);

module.exports = articlesRouter;
