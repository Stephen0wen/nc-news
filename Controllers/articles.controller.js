const { authenticate } = require("../Auth/authenticate");
const {
    selectArticles,
    totalCount,
    insertArticle,
    selectArticle,
    updateArticle,
    dbDeleteArticle,
    selectCommentsByArticle,
    insertCommentByArticle,
} = require("../Models/articles.model");
const { selectTopic } = require("../Models/topics.model");

exports.getArticles = (request, response, next) => {
    const { topic, order, sort_by, limit, p } = request.query;
    const promises = [
        selectArticles(topic, order, sort_by, limit, p),
        totalCount(topic),
    ];

    if (topic) {
        promises.push(selectTopic(topic));
    }

    return Promise.all(promises)
        .then(([articles, { total_count }]) => {
            response.status(200).send({ articles, total_count });
        })
        .catch((error) => {
            next(error);
        });
};

exports.postArticle = (request, response, next) => {
    const { title, body, topic, article_img_url } = request.body;

    authenticate(request)
        .then(({ uid }) => {
            return insertArticle(uid, title, body, topic, article_img_url);
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

exports.deleteArticle = (request, response, next) => {
    const { article_id } = request.params;
    authenticate(request)
        .then(({ uid }) => {
            return dbDeleteArticle(uid, article_id);
        })
        .then(() => {
            response.status(204).send({});
        })
        .catch((error) => {
            next(error);
        });
};

exports.getCommentsByArticle = (request, response, next) => {
    const { article_id } = request.params;
    const { limit, p } = request.query;
    return Promise.all([
        selectCommentsByArticle(article_id, limit, p),
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
    const { body } = request.body;

    authenticate(request)
        .then(({ uid }) => {
            return insertCommentByArticle(article_id, uid, body);
        })
        .then((comment) => {
            response.status(201).send({ comment });
        })
        .catch((error) => {
            next(error);
        });
};
