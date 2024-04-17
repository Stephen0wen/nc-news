const {
    selectArticles,
    selectArticle,
    updateArticle,
    selectCommentsByArticle,
    insertCommentByArticle,
} = require("../Models/articles.model");
const { selectTopic } = require("../Models/topics.model");

exports.getArticles = (request, response, next) => {
    const { topic, order, sort_by } = request.query;
    const promises = [selectArticles(topic, order, sort_by)];

    if (topic) {
        promises.push(selectTopic(topic));
    }

    return Promise.all(promises)
        .then(([articles]) => {
            response.status(200).send({ articles });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getArticle = (request, response, next) => {
    const article_id = request.params.article_id;
    selectArticle(article_id)
        .then((article) => {
            response.status(200).send({ article });
        })
        .catch((error) => {
            next(error);
        });
};

exports.patchArticle = (request, response, next) => {
    const article_id = request.params.article_id;
    const body = request.body;
    updateArticle(article_id, body)
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
        selectArticle(article_id),
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
    insertCommentByArticle(article_id, body)
        .then((comment) => {
            response.status(201).send({ comment });
        })
        .catch((error) => {
            next(error);
        });
};
