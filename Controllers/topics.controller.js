const { authenticate } = require("../Auth/authenticate");
const {
    selectTopics,
    insertTopic,
    dbDeleteTopic,
} = require("../Models/topics.model");

exports.getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    });
};

exports.postTopic = (request, response, next) => {
    const { slug, description } = request.body;
    authenticate(request)
        .then(() => {
            return insertTopic(slug, description);
        })
        .then((topic) => {
            response.status(201).send({ topic });
        })
        .catch((error) => {
            next(error);
        });
};

exports.deleteTopic = (request, response, next) => {
    const { slug } = request.params;
    dbDeleteTopic(slug)
        .then(() => {
            response.status(204).send({});
        })
        .catch((error) => {
            next(error);
        });
};
