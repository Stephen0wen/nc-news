const { selectTopics, insertTopic } = require("../Models/topics.model");

exports.getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    });
};

exports.postTopic = (request, response, next) => {
    const { slug, description } = request.body;
    insertTopic(slug, description).then((topic) => {
        response.status(201).send({ topic });
    });
};
