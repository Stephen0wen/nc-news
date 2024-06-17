const { authenticate } = require("../Auth/authenticate");
const { selectUsers, selectUser } = require("../Models/users.model");

exports.getUsers = (request, response, next) => {
    authenticate(request)
        .then(() => {
            return selectUsers();
        })
        .then((users) => {
            response.status(200).send({ users });
        })
        .catch((error) => {
            next(error);
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
