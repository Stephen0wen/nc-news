const {
    getUsers,
    getUser,
    postUser,
} = require("../Controllers/users.controller");
const usersRouter = require("express").Router({ mergeParams: true });

usersRouter.route("/").get(getUsers).post(postUser);

usersRouter.route("/:uuid").get(getUser);

module.exports = usersRouter;
