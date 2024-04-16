const db = require("../db/connection");

exports.selectArticles = () => {
    return db
        .query(
            `
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
    ON comments.article_id = articles.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.selectArticleById = (article_id) => {
    return db
        .query(
            `
    SELECT *
    FROM articles
    WHERE article_id = $1`,
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
