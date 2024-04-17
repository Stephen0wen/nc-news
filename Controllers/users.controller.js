const { selectUsers } = require("../Models/users.model");

exports.getUsers = (request, response, next) => {
    selectUsers().then((users) => {
        response.status(200).send({ users });
    });
};
