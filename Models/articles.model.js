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

exports.selectArticleById = (id) => {
    return db
        .query(
            `
    SELECT *
    FROM articles
    WHERE article_id = $1`,
            [id]
        )
        .then(({ rows }) => {
            if (!rows.length) {
                return Promise.reject({
                    status: 404,
                    msg: "Article not found",
                });
            }
            return rows[0];
        })
        .catch((error) => {
            return Promise.reject(error);
        });
};

exports.selectCommentsByArticle = (id) => {
    return db
        .query(
            `
    SELECT comment_id, votes, created_at, author, body, article_id
    FROM comments
    Where article_id = $1
    ORDER BY created_at DESC`,
            [id]
        )
        .then(({ rows }) => {
            return rows;
        });
};
