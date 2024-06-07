const db = require("../db/connection");

exports.selectTopics = () => {
    return db
        .query(
            `
    SELECT *
    FROM topics;`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.selectTopic = (slug) => {
    return db
        .query(
            `
    SELECT *
    FROM topics
    WHERE slug = $1`,
            [slug]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: "Topic not found" });
            }
            return rows;
        });
};

exports.insertTopic = (slug, description) => {
    return db
        .query(
            `
    INSERT INTO topics
        (slug, description)
    VALUES
        ($1, $2)
    RETURNING *`,
            [slug, description]
        )
        .then(({ rows }) => {
            return rows[0];
        });
};

exports.dbDeleteTopic = (slug) => {
    return db
        .query(
            `
        SELECT article_id
        FROM articles
        WHERE topic = $1;
        `,
            [slug]
        )
        .then(({ rows }) => {
            if (rows.length) {
                const article_ids = rows.map(({ article_id }) => {
                    return article_id;
                });
                return db.query(
                    `
        DELETE FROM comments
        WHERE article_id IN (${article_ids.join(",")})
                `
                );
            }
        })
        .then(() => {
            return db.query(
                `
        DELETE FROM articles
        WHERE topic = $1
        RETURNING *;
                `,
                [slug]
            );
        })
        .then(() => {
            return db.query(
                `
        DELETE FROM topics
        WHERE slug = $1
        RETURNING *;        
                `,
                [slug]
            );
        });
};
