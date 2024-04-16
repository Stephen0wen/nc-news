const { selectTopics } = require("../Models/topics.model");

exports.getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    });
};
