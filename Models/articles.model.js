const db = require("../db/connection");

exports.selectArticles = (
    topic,
    order = "desc",
    sort_by = "created_at",
    limit,
    page
) => {
    const upperCaseOrder = order.toUpperCase();
    const validOrders = ["ASC", "DESC"];
    const validSortBys = [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "comment_count",
    ];

    if (page && limit === undefined) {
        limit = 10;
    }

    if (
        !validOrders.includes(upperCaseOrder) ||
        !validSortBys.includes(sort_by) ||
        (limit && Number.isNaN(Number(limit))) ||
        (page && Number.isNaN(Number(page)))
    ) {
        return Promise.reject({ status: 400, msg: "Invalid Query Value" });
    }

    const sqlArray = [];
    let insertPosition = 1;
    let sqlString = `
    SELECT
        users.username AS author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comment_id)::INT AS comment_count
    FROM articles
    INNER JOIN users
    ON articles.author_id = users.user_id
    LEFT JOIN comments
    ON comments.article_id = articles.article_id`;

    if (topic) {
        sqlString += `
    WHERE articles.topic = $${insertPosition++}`;
        sqlArray.push(topic);
    }

    sqlString += `
    GROUP BY
        articles.article_id,
        author
    ORDER BY ${sort_by} ${upperCaseOrder}`;

    if (limit) {
        sqlString += `
    LIMIT $${insertPosition++}`;
        sqlArray.push(limit);
    }

    if (page) {
        const offset = (page - 1) * limit;
        sqlString += `
    OFFSET $${insertPosition++}`;
        sqlArray.push(offset);
    }

    return db.query(sqlString, sqlArray).then(({ rows }) => {
        return rows;
    });
};

exports.totalCount = (topic) => {
    const sqlArray = [];
    let sqlString = `
    SELECT COUNT(article_id)::INT AS total_count
    FROM articles`;

    if (topic) {
        sqlString += `
    WHERE topic = $1`;
        sqlArray.push(topic);
    }

    return db.query(sqlString, sqlArray).then(({ rows }) => {
        return rows[0];
    });
};

exports.insertArticle = (uid, title, body, topic, article_img_url) => {
    return db
        .query(
            `
    SELECT user_id
    FROM users
    WHERE uuid = $1    
        `,
            [uid]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Author not found",
                });
            }

            const { user_id } = rows[0];
            return user_id;
        })
        .then((user_id) => {
            const created_at = new Date();
            if (!article_img_url) {
                article_img_url =
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700";
            }

            return db.query(
                `
    INSERT INTO articles
        (author_id, title, body, topic, article_img_url, created_at)
    VALUES
        ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
                [user_id, title, body, topic, article_img_url, created_at]
            );
        })

        .then(({ rows }) => {
            rows[0].comment_count = 0;
            return rows[0];
        });
};

exports.selectArticle = (article_id) => {
    return db
        .query(
            `
    SELECT 
        users.username AS author,
        articles.title,
        articles.article_id,
        articles.body,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        COUNT(comment_id)::int AS comment_count 
    FROM articles
    INNER JOIN users
    ON articles.author_id = users.user_id
    LEFT JOIN comments
    ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY 
        articles.article_id,
        author;`,
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

exports.updateArticle = (article_id, inc_votes) => {
    return db
        .query(
            `
    UPDATE articles
    SET
        votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
            [inc_votes, article_id]
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

exports.dbDeleteArticle = (uid, article_id) => {
    return db
        .query(
            `
    SELECT *
    FROM articles
    INNER JOIN users
    ON articles.author_id = users.user_id
    WHERE 
        article_id = $1   
        `,
            [article_id]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Article not found",
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
    WHERE article_id = $1;`,
                [article_id]
            );
        })
        .then(() => {
            return db.query(
                `
    DELETE FROM articles
    WHERE article_id = $1
    RETURNING *;`,
                [article_id]
            );
        })
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Article not found",
                });
            }
        });
};

exports.selectCommentsByArticle = (article_id, limit, page) => {
    if (page && !limit) {
        limit = 10;
    }

    if (
        (limit && Number.isNaN(Number(limit))) ||
        (page && Number.isNaN(Number(page)))
    ) {
        return Promise.reject({ status: 400, msg: "Invalid Query Value" });
    }

    const sqlArray = [article_id];
    let sqlString = `
    SELECT 
        comment_id,
        votes, 
        created_at, 
        users.username AS author, 
        body, 
        article_id
    FROM comments
    INNER JOIN users
    ON comments.author_id = users.user_id
    WHERE article_id = $1 
    ORDER BY created_at DESC`;

    if (limit) {
        sqlString += `
    LIMIT $2`;
        sqlArray.push(limit);
    }

    if (page) {
        const offset = (page - 1) * limit;
        sqlString += `
    OFFSET $3`;
        sqlArray.push(offset);
    }

    return db.query(sqlString, sqlArray).then(({ rows }) => {
        return rows;
    });
};

exports.insertCommentByArticle = (article_id, uid, body) => {
    return db
        .query(
            `
    SELECT user_id
    FROM users
    WHERE uuid = $1    
        `,
            [uid]
        )
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: "Author not found",
                });
            }

            const { user_id } = rows[0];
            return user_id;
        })
        .then((user_id) => {
            const created_at = new Date();

            return db.query(
                `
    INSERT INTO comments
        (article_id, author_id, body, created_at)
    VALUES
        ($1, $2, $3, $4)
    RETURNING *`,
                [article_id, user_id, body, created_at]
            );
        })

        .then(({ rows }) => {
            return rows[0];
        });
};
