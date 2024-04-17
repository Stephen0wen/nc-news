const { getUsers, getUser } = require("../Controllers/users.controller");
const usersRouter = require("express").Router({ mergeParams: true });

usersRouter.route("/").get(getUsers);

usersRouter.route("/:username").get(getUser);

module.exports = usersRouter;
