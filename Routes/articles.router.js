const {
    getArticles,
    postArticle,
    getArticle,
    patchArticle,
    deleteArticle,
    getCommentsByArticle,
    postCommentByArticle,
} = require("../Controllers/articles.controller");
const articlesRouter = require("express").Router({ mergeParams: true });

articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
    .route("/:article_id")
    .get(getArticle)
    .patch(patchArticle)
    .delete(deleteArticle);

articlesRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticle)
    .post(postCommentByArticle);

module.exports = articlesRouter;
