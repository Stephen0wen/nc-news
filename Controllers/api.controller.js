const { selectTopics } = require("../Models/api.model");
const endpoints = require("../endpoints.json");

exports.getApi = (request, response, next) => {
    response.status(200).send({ endpoints });
};

exports.getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    });
};
