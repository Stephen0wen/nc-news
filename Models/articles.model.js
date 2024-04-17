const db = require("../db/connection");

exports.selectArticles = (topic) => {
    const sqlArray = [];
    let sqlString = `
    SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON comments.article_id = articles.article_id`;

    if (topic) {
        sqlString += "\nWHERE articles.topic = $1";
        sqlArray.push(topic);
    }

    sqlString += `
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`;

    return db.query(sqlString, sqlArray).then(({ rows }) => {
        return rows;
    });
};

exports.selectArticle = (article_id) => {
    return db
        .query(
            `
    SELECT 
        articles.author,
        articles.title,
        articles.article_id,
        articles.body,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comment_id)::int AS comment_count 
    FROM articles
    LEFT JOIN comments
    ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
            [article_id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Article not found",
                });
            }
            return rows[0];
        });
};

exports.updateArticle = (article_id, body) => {
    return db
        .query(
            `
    UPDATE articles
    SET
        votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
            [body.inc_votes, article_id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Article not found",
                });
            }
            return rows[0];
        });
};

exports.selectCommentsByArticle = (article_id, body) => {
    return db
        .query(
            `
            SELECT comment_id, votes, created_at, author, body, article_id
            FROM comments
            Where article_id = $1
            ORDER BY created_at DESC`,
            [article_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.insertCommentByArticle = (article_id, body) => {
    const created_at = new Date();
    return db
        .query(
            `
    INSERT INTO comments
        (article_id, author, body, created_at)
    VALUES
        ($1, $2, $3, $4)
    RETURNING *`,
            [article_id, body.username, body.body, created_at]
        )
        .then(({ rows }) => {
            return rows[0];
        });
};
