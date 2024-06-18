const { authenticate } = require("../Auth/authenticate");
const {
    selectUsers,
    selectUser,
    insertUser,
} = require("../Models/users.model");

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

exports.postUser = (request, response, next) => {
    authenticate(request)
        .then(({ uid: firebaseUid }) => {
            if (request.body.uuid !== firebaseUid) {
                return Promise.reject({
                    status: 403,
                    msg: "Authentication Failed",
                });
            }
            return insertUser(request.body);
        })
        .then((user) => {
            response.status(201).send({ user });
        })
        .catch((error) => {
            next(error);
        });
};
