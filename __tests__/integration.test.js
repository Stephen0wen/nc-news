const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const { describe, test } = require("@jest/globals");
const endpoints = require("../endpoints.json");
const { response } = require("express");

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("/api", () => {
    test("GET:200 Should send an object describing all the available endpoints to the client", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
                expect(body.endpoints).toEqual(endpoints);
            });
    });
});

describe("/api/topics", () => {
    test("GET:200 Should send an array of topics to the client", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then((response) => {
                const topics = response.body.topics;
                expect(topics.length).toBe(3);
                topics.forEach((topic) => {
                    expect(typeof topic.slug).toBe("string");
                    expect(typeof topic.description).toBe("string");
                });
            });
    });
});

describe("/api/articles", () => {
    test("GET:200 Should send an array of articles to the client", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then((response) => {
                const articles = response.body.articles;
                expect(articles.length).toBe(13);
                articles.forEach((article) => {
                    expect(Object.keys(article).length).toBe(8);
                    expect(typeof article.author).toBe("string");
                    expect(typeof article.title).toBe("string");
                    expect(typeof article.article_id).toBe("number");
                    expect(typeof article.topic).toBe("string");
                    expect(typeof article.created_at).toBe("string");
                    expect(typeof article.votes).toBe("number");
                    expect(typeof article.article_img_url).toBe("string");
                    expect(typeof article.comment_count).toBe("string");
                });
            });
    });
    test("GET:200 Articles should be sorted by 'created_at' property by default", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then((response) => {
                const articles = response.body.articles;
                expect(articles).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET:200 Should send the requested object on a key of 'article'", () => {
        return request(app)
            .get("/api/articles/4")
            .expect(200)
            .then((response) => {
                const article = response.body.article;
                expect(Object.keys(article).length).toBe(8);
                expect(typeof article.author).toBe("string");
                expect(typeof article.title).toBe("string");
                expect(article.article_id).toBe(4);
                expect(typeof article.body).toBe("string");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
            });
    });
    test("GET:404 If a valid id is given, but id does not exist in the database, an arror message should be sent", () => {
        return request(app)
            .get("/api/articles/9999")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Article not found");
            });
    });
    test("GET:400 If an invalid id is given, an arror message should be sent", () => {
        return request(app)
            .get("/api/articles/string")
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
    test("PATCH:200 Should update the requested article and send the new version on a key of 'article'", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 5 })
            .expect(200)
            .then((response) => {
                const article = response.body.article;
                expect(Object.keys(article).length).toBe(8);
                expect(typeof article.author).toBe("string");
                expect(typeof article.title).toBe("string");
                expect(article.article_id).toBe(1);
                expect(typeof article.body).toBe("string");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(article.votes).toBe(105);
                expect(typeof article.article_img_url).toBe("string");
            });
    });
});

describe("/api/articles/:article_id/comments", () => {
    test("GET:200 Should send an array of comments for the given article_id", () => {
        return request(app)
            .get("/api/articles/9/comments")
            .expect(200)
            .then((response) => {
                const comments = response.body.comments;
                expect(comments.length).toBe(2);
                comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe("number");
                    expect(typeof comment.votes).toBe("number");
                    expect(typeof comment.created_at).toBe("string");
                    expect(typeof comment.author).toBe("string");
                    expect(typeof comment.body).toBe("string");
                    expect(comment.article_id).toBe(9);
                });
            });
    });
    test("GET:200 Comments should be sorted by 'created_at' property by default", () => {
        return request(app)
            .get("/api/articles/9/comments")
            .expect(200)
            .then((response) => {
                const comments = response.body.comments;
                expect(comments).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
    test("GET:200 Should send an empty array when given a valid id, which exists, but there are no associated comments", () => {
        return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then((response) => {
                const comments = response.body.comments;
                expect(comments).toEqual([]);
            });
    });
    test("GET:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .get("/api/articles/9999/comments")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Article not found");
            });
    });
    test("GET:400 If an invalid id is given, an arror message should be sent", () => {
        return request(app)
            .get("/api/articles/string_for_id/comments")
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
    test("POST:201 Should insert the new comment into the database and send the object back to the client", () => {
        return request(app)
            .post("/api/articles/2/comments")
            .send({
                username: "rogersop",
                body: "This is a test comment...",
            })
            .expect(201)
            .then((response) => {
                const comment = response.body.comment;
                expect(Object.keys(comment).length).toBe(6);
                expect(typeof comment.comment_id).toBe("number");
                expect(typeof comment.votes).toBe("number");
                expect(typeof comment.created_at).toBe("string");
                expect(typeof comment.author).toBe("string");
                expect(typeof comment.body).toBe("string");
                expect(comment.article_id).toBe(2);
            });
    });
    test("POST:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .post("/api/articles/9999/comments")
            .send({
                username: "rogersop",
                body: "This is a test comment...",
            })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Article not found");
            });
    });
    test("POST:400 If an invalid id is given, an arror message should be sent", () => {
        return request(app)
            .post("/api/articles/dodgyID/comments")
            .send({
                username: "rogersop",
                body: "This is a test comment...",
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
    test("POST:400 If an invalid request body is given, an error message should be sent", () => {
        return request(app)
            .post("/api/articles/2/comments")
            .send({
                username: "rogersop",
                notBody: "This is not a comment...",
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request Body");
            });
    });
});

describe("any other path", () => {
    test("GET:404 Should send a 404 error with a message when an invalid path is given", () => {
        return request(app)
            .get("/api/tropics")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Path not found");
            });
    });
});
