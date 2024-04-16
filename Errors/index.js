exports.handleInvalidPath = (request, response, next) => {
    response.status(404).send({ msg: "Path not found" });
};

exports.handleCustomErrors = (error, request, response, next) => {
    if (error.status && error.msg) {
        response.status(error.status).send({ msg: error.msg });
    }
    next(error);
};

exports.handlePsqlErrors = (error, request, response, next) => {
    if (error.code === "22P02") {
        response.status(400).send({ msg: "Invalid Request" });
    }

    if (error.code === "23502") {
        response.status(400).send({ msg: "Invalid Request Body" });
    }

    if (error.code === "23503" && error.constraint === "comments_author_fkey") {
        response.status(404).send({ msg: "User not found" });
    }

    if (
        error.code === "23503" &&
        error.constraint === "comments_article_id_fkey"
    ) {
        response.status(404).send({ msg: "Article not found" });
    }

    next(error);
};
