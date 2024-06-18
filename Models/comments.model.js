const db = require("../db/connection");

exports.updateComment = (comment_id, inc_votes) => {
    return db
        .query(
            `
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`,
            [inc_votes, comment_id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Comment not found",
                });
            }
            return rows[0];
        });
};

exports.dbDeleteComment = (comment_id, uid) => {
    return db
        .query(
            `
    SELECT *
    FROM comments
    INNER JOIN users
    ON comments.author_id = users.user_id
    WHERE comment_id = $1    
        `,
            [comment_id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Comment not found",
                });
            }
            if (rows[0].uuid !== uid) {
                return Promise.reject({
                    status: 403,
                    msg: "Authentication Failed",
                });
            }
            return db.query(
                `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;`,
                [comment_id]
            );
        })
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Comment not found",
                });
            }
        });
};
