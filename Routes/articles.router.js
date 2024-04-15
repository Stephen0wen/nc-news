const articlesRouter = require("express").Router({ mergeParams: true });
const {
    getArticles,
    getArticle,
} = require("../Controllers/articles.controller");

articlesRouter.route("/").get(getArticles);

articlesRouter.route("/:article_id").get(getArticle);

module.exports = articlesRouter;
