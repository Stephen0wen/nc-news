const { getUsers } = require("../Controllers/users.controller");
const usersRouter = require("express").Router({ mergeParams: true });

usersRouter.route("/").get(getUsers);

module.exports = usersRouter;
