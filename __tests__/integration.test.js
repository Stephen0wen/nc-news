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
                expect(article.author).toBe("rogersop");
                expect(article.title).toBe("Student SUES Mitch!");
                expect(article.article_id).toBe(4);
                expect(article.body).toBe(
                    "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages"
                );
                expect(article.topic).toBe("mitch");
                expect(typeof article.created_at).toBe("string");
                expect(article.votes).toBe(0);
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                );
            });
    });
    test("GET:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .get("/api/articles/9999")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Article not found");
            });
    });
    test("GET:400 If an invalid id is given, an error message should be sent", () => {
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
                expect(article.author).toBe("butter_bridge");
                expect(article.title).toBe(
                    "Living in the shadow of a great man"
                );
                expect(article.article_id).toBe(1);
                expect(article.body).toBe("I find this existence challenging");
                expect(article.topic).toBe("mitch");
                expect(typeof article.created_at).toBe("string");
                expect(article.votes).toBe(105);
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                );
            });
    });
    test("PATCH:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .patch("/api/articles/9999")
            .send({ inc_votes: 5 })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Article not found");
            });
    });
    test("PATCH:400 If an invalid id is given, an error message should be sent", () => {
        return request(app)
            .patch("/api/articles/not_an_id")
            .send({ inc_votes: 5 })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
    test("PATCH:400 If an invalid request body is given, an error message should be sent", () => {
        return request(app)
            .patch("/api/articles/1")
            .send({ wrong_key: 5 })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request Body");
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
    test("GET:400 If an invalid id is given, an error message should be sent", () => {
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
                expect(comment.comment_id).toBe(19);
                expect(comment.votes).toBe(0);
                expect(typeof comment.created_at).toBe("string");
                expect(comment.author).toBe("rogersop");
                expect(comment.body).toBe("This is a test comment...");
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
    test("POST:400 If an invalid id is given, an error message should be sent", () => {
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
    test("POST:404 If a valid request body is given, but the username is not in the database, an error message should be sent", () => {
        return request(app)
            .post("/api/articles/2/comments")
            .send({
                username: "clandestine_user",
                body: "This is a test comment",
            })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("User not found");
            });
    });
});

describe("/api/comments/:comment_id", () => {
    test("DELETE:200 Should delete the comment from the database and send it back to the client", () => {
        return request(app)
            .delete("/api/comments/5")
            .expect(204)
            .then((response) => {
                expect(response.body).toEqual({});
            });
    });
    test("DELETE:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .delete("/api/comments/9999")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Comment not found");
            });
    });
    test("DELETE 400 If an invalid id is given, an error message should be sent", () => {
        return request(app)
            .delete("/api/comments/wrong_format")
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
});

describe("/api/users", () => {
    test("GET:200 Should send an array of all users", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then((response) => {
                const users = response.body.users;
                expect(users.length).toBe(4);
                users.forEach((user) => {
                    expect(Object.keys(user).length).toBe(3);
                    expect(typeof user.username).toBe("string");
                    expect(typeof user.name).toBe("string");
                    expect(typeof user.avatar_url).toBe("string");
                });
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
