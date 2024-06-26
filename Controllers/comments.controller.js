const { authenticate } = require("../Auth/authenticate");
const { updateComment, dbDeleteComment } = require("../Models/comments.model");

exports.patchComment = (request, response, next) => {
    const { comment_id } = request.params;
    const { inc_votes } = request.body;
    return updateComment(comment_id, inc_votes)
        .then((comment) => {
            response.status(200).send({ comment });
        })
        .catch((error) => {
            next(error);
        });
};

exports.deleteComment = (request, response, next) => {
    const { comment_id } = request.params;

    authenticate(request)
        .then(({ uid }) => {
            return dbDeleteComment(comment_id, uid);
        })
        .then(() => {
            response.status(204).send();
        })
        .catch((error) => {
            next(error);
        });
};
