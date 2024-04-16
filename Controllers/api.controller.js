const endpoints = require("../endpoints.json");

exports.getApi = (request, response, next) => {
    response.status(200).send({ endpoints });
};
