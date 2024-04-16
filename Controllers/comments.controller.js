const { dbDeleteComment } = require("../Models/comments.model");

exports.deleteComment = (request, response, next) => {
    const comment_id = request.params.comment_id;
    return dbDeleteComment(comment_id)
        .then(() => {
            response.status(204).send();
        })
        .catch((error) => {
            next(error);
        });
};
