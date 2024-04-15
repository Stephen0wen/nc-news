const { selectTopics } = require("../Models/api.model");
const api = require("../endpoints.json");

exports.getApi = (request, response, next) => {
    response.status(200).send(api);
};

exports.getTopics = (request, response, next) => {
    selectTopics().then((topics) => {
        response.status(200).send({ topics });
    });
};
