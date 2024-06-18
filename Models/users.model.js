const db = require("../db/connection");

exports.selectUsers = () => {
    return db
        .query(
            `
    SELECT *
    FROM users`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.selectUser = (username) => {
    return db
        .query(
            `
    SELECT *
    FROM users
    WHERE username = $1;`,
            [username]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "User not found" });
            }
            return rows[0];
        });
};

exports.insertUser = ({ username, name, avatar_url, uuid }) => {
    return db
        .query(
            `
    SELECT *
    FROM users
    WHERE uuid = $1    
    `,
            [uuid]
        )
        .then(({ rows }) => {
            if (rows.length) {
                return Promise.reject({
                    status: 400,
                    msg: "User Already Exists",
                });
            }

            return db.query(
                `
    INSERT INTO users
        (username, name, avatar_url, uuid)
    VALUES
        ($1, $2, $3, $4)
    RETURNING *    
            `,
                [username, name, avatar_url, uuid]
            );
        })

        .then(({ rows }) => {
            return rows[0];
        });
};
