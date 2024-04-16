const {
    selectArticles,
    selectArticleById,
    selectCommentsByArticle,
    insertCommentByArticle,
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

exports.getCommentsByArticle = (request, response, next) => {
    const article_id = request.params.article_id;
    return Promise.all([
        selectCommentsByArticle(article_id),
        selectArticleById(article_id),
    ])
        .then(([comments]) => {
            response.status(200).send({ comments });
        })
        .catch((error) => {
            next(error);
        });
};

exports.postCommentByArticle = (request, response, next) => {
    const article_id = request.params.article_id;
    const body = request.body;
    insertCommentByArticle(article_id, body).then((comment) => {
        response.status(201).send({ comment });
    });
};
