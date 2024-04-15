const {
    selectArticles,
    selectArticleById,
} = require("../Models/articles.model");

exports.getArticles = (request, response, next) => {
    selectArticles().then((articles) => {
        response.status(200).send({ articles });
    });
};

exports.getArticle = (request, response, next) => {
    const article_id = request.params.article_id;
    selectArticleById(article_id)
        .then((article) => {
            response.status(200).send({ article });
        })
        .catch((error) => {
            next(error);
        });
};
