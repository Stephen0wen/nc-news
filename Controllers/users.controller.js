const { selectUsers, selectUser } = require("../Models/users.model");

exports.getUsers = (request, response, next) => {
    selectUsers().then((users) => {
        response.status(200).send({ users });
    });
};

exports.getUser = (request, response, next) => {
    const { username } = request.params;
    selectUser(username)
        .then((user) => {
            response.status(200).send({ user });
        })
        .catch((error) => {
            next(error);
        });
};
