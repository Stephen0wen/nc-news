const {
    selectArticles,
    insertArticle,
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

exports.postArticle = (request, response, next) => {
    const { author, title, body, topic, article_img_url } = request.body;
    insertArticle(author, title, body, topic, article_img_url)
        .then(({ article_id }) => {
            return selectArticle(article_id);
        })
        .then((article) => {
            response.status(201).send({ article });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getArticle = (request, response, next) => {
    const { article_id } = request.params;
    selectArticle(article_id)
        .then((article) => {
            response.status(200).send({ article });
        })
        .catch((error) => {
            next(error);
        });
};

exports.patchArticle = (request, response, next) => {
    const { article_id } = request.params;
    const { inc_votes } = request.body;
    updateArticle(article_id, inc_votes)
        .then((article) => {
            response.status(200).send({ article });
        })
        .catch((error) => {
            next(error);
        });
};

exports.getCommentsByArticle = (request, response, next) => {
    const { article_id } = request.params;
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
    const { article_id } = request.params;
    const { username, body } = request.body;
    insertCommentByArticle(article_id, username, body)
        .then((comment) => {
            response.status(201).send({ comment });
        })
        .catch((error) => {
            next(error);
        });
};
