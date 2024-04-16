const articlesRouter = require("express").Router({ mergeParams: true });
const {
    getArticles,
    getArticle,
    patchArticle,
    getCommentsByArticle,
    postCommentByArticle,
} = require("../Controllers/articles.controller");

articlesRouter.route("/").get(getArticles);

articlesRouter.route("/:article_id").get(getArticle).patch(patchArticle);

articlesRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticle)
    .post(postCommentByArticle);

module.exports = articlesRouter;
