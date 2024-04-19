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
    test.only("POST:201 Should post a new topic and return the new topic in an object", () => {
        return request(app)
            .post("/api/topics")
            .send({
                slug: "fish",
                description: "A place for articles about aquatic creatures",
            })
            .expect(201)
            .then((response) => {
                const { topic } = response.body;
                expect(topic.slug).toBe("fish");
                expect(topic.description).toBe(
                    "A place for articles about aquatic creatures"
                );
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
                    expect(typeof article.comment_count).toBe("number");
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
    test("GET:200 Should accept a topic query, which filters the response to only include articles with the given topic", () => {
        return request(app)
            .get("/api/articles")
            .query({ topic: "cats" })
            .expect(200)
            .then((response) => {
                const articles = response.body.articles;
                expect(articles.length).toBe(1);
                expect(articles[0].title).toBe(
                    "UNCOVERED: catspiracy to bring down democracy"
                );
                expect(articles[0].topic).toBe("cats");
                expect(articles[0].author).toBe("rogersop");
                expect(typeof articles[0].created_at).toBe("string");
                expect(articles[0].article_img_url).toBe(
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                );
            });
    });
    test("GET:200 When topic query exists but has no associated articles, an empty array should be sent", () => {
        return request(app)
            .get("/api/articles")
            .query({ topic: "paper" })
            .expect(200)
            .then((response) => {
                const articles = response.body.articles;
                expect(articles.length).toBe(0);
            });
    });
    test("GET:404 When the topic query is valid, but topic does not exist in the database, an error message should be sent", () => {
        return request(app)
            .get("/api/articles")
            .query({ topic: "Fake_Topic" })
            .expect(404)
            .then((error) => {
                expect(error.body.msg).toBe("Topic not found");
            });
    });
    test("GET:200 Invalid query keys should be ignored", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({ tropic: "mitch" })
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
                    expect(typeof article.comment_count).toBe("number");
                });
            });
    });
    test("GET:200 Should accept an 'order' query which can set the sort order to either asc(ending) or desc(ending)", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({ order: "asc" })
            .then((response) => {
                const articles = response.body.articles;
                expect(articles).toBeSortedBy("created_at");
            });
    });
    test("GET:200 Should accept a 'sort_by' query which determines which column the response should be sorted by", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({ sort_by: "comment_count" })
            .then((response) => {
                const articles = response.body.articles;
                expect(articles).toBeSortedBy("comment_count", {
                    descending: true,
                });
            });
    });
    test("GET:200 Sort/Filter queries should all function concurrently", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({ sort_by: "title", order: "asc", topic: "mitch" })
            .then((response) => {
                const articles = response.body.articles;
                expect(articles).toBeSortedBy("title");
                articles.forEach((article) => {
                    expect(typeof article.author).toBe("string");
                    expect(typeof article.title).toBe("string");
                    expect(typeof article.article_id).toBe("number");
                    expect(article.topic).toBe("mitch");
                    expect(typeof article.created_at).toBe("string");
                    expect(typeof article.votes).toBe("number");
                    expect(typeof article.article_img_url).toBe("string");
                    expect(typeof article.comment_count).toBe("number");
                });
            });
    });
    test("GET:200 Should accept a 'limit' query, which causes only the specified number of articles to be sent", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({ limit: 5 })
            .then((response) => {
                const articles = response.body.articles;
                expect(articles.length).toBe(5);
            });
    });
    test("GET:200 Should accept a 'p' (page) query, which works alongside the limit query to enable pagination", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({
                limit: 5,
                p: 2,
                sort_by: "article_id",
                order: "asc",
            })
            .then((response) => {
                const articles = response.body.articles;
                expect(articles.length).toBe(5);
                articles.forEach((article, index) => {
                    expect(article.article_id).toBe(index + 6);
                });
            });
    });
    test("GET:200 If a 'p' (page) query is given with no limit, the limit will default to 10", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({
                p: 2,
                sort_by: "article_id",
                order: "asc",
            })
            .then((response) => {
                const articles = response.body.articles;
                articles.forEach((article, index) => {
                    expect(article.article_id).toBe(index + 11);
                });
            });
    });
    test("GET:200 Should respond with a total count of the number of articles (post filtering) on a separate key from the articles", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .query({
                p: 2,
                limit: 5,
                topic: "mitch",
            })
            .then((response) => {
                expect(response.body.total_count).toBe(12);
            });
    });
    test("GET:400 Invalid sort_by query values should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles")
            .expect(400)
            .query({ sort_by: "not_a_column" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
            });
    });
    test("GET:400 Invalid sort_by query values should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles")
            .expect(400)
            .query({ order: "any_old_how" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
            });
    });
    test("GET:400 Invalid limit query values should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles")
            .expect(400)
            .query({ limit: "not_a_valid_limit" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
            });
    });
    test("GET:400 Invalid page query should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles")
            .expect(400)
            .query({ p: "not_a_valid_page" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
            });
    });
    test("POST:201 Should add an article to the database and send the new article", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "icellusedkars",
                title: "An article about paper",
                body: "A very long discussion about paper",
                topic: "paper",
                article_img_url:
                    "https://www.collinsdictionary.com/images/full/paper_111691001.jpg",
            })
            .expect(201)
            .then((response) => {
                const { article } = response.body;
                expect(article.author).toBe("icellusedkars");
                expect(article.title).toBe("An article about paper");
                expect(article.article_id).toBe(14);
                expect(article.body).toBe("A very long discussion about paper");
                expect(article.topic).toBe("paper");
                expect(article.votes).toBe(0);
                expect(article.article_img_url).toBe(
                    "https://www.collinsdictionary.com/images/full/paper_111691001.jpg"
                );
                expect(typeof article.created_at).toBe("string");
                expect(article.comment_count).toBe(0);
            });
    });
    test("POST:201 Should add a default image url if none is given in the request body", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "icellusedkars",
                title: "An article about paper",
                body: "A very long discussion about paper",
                topic: "paper",
            })
            .expect(201)
            .then((response) => {
                const { article } = response.body;
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                );
            });
    });
    test("POST:400 Invalid request body should cause an error", () => {
        return request(app)
            .post("/api/articles")
            .send({
                author: "icellusedkars",
                title: "An article about paper",
                notBody: "A very long discussion about paper",
                topic: "paper",
            })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request Body");
            });
    });
});

describe("/api/articles/:article_id", () => {
    test("GET:200 Should send the correct requested object on a key of 'article' when there are comments", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then((response) => {
                const article = response.body.article;
                expect(Object.keys(article).length).toBe(9);
                expect(article.author).toBe("butter_bridge");
                expect(article.title).toBe(
                    "Living in the shadow of a great man"
                );
                expect(article.article_id).toBe(1);
                expect(article.body).toBe("I find this existence challenging");
                expect(article.topic).toBe("mitch");
                expect(typeof article.created_at).toBe("string");
                expect(article.votes).toBe(100);
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
                );
                expect(article.comment_count).toBe(11);
            });
    });
    test("GET:200 Should send the correct requested object on a key of 'article' when there are no comments", () => {
        return request(app)
            .get("/api/articles/4")
            .expect(200)
            .then((response) => {
                const article = response.body.article;
                expect(Object.keys(article).length).toBe(9);
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
                expect(article.comment_count).toBe(0);
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
    test("GET:200 Should accept a 'limit' query, which causes only the specified number of articles to be sent", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .query({ limit: 5 })
            .then((response) => {
                const { comments } = response.body;
                expect(comments.length).toBe(5);
            });
    });
    test("GET:200 Should accept a 'p' (page) query, which works alongside the limit query to enable pagination", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .query({
                limit: 5,
                p: 2,
            })
            .then((response) => {
                const { comments } = response.body;
                expect(comments.length).toBe(5);
                const comment_ids = [8, 6, 12, 3, 4];
                comments.forEach((comment) => {
                    expect(comment_ids.includes(comment.comment_id)).toBe(true);
                });
            });
    });
    test("GET:200 If a 'p' (page) query is given with no limit, the limit will default to 10", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .query({
                p: 1,
            })
            .then((response) => {
                const { comments } = response.body;
                expect(comments.length).toBe(10);
            });
    });
    test("GET:400 Invalid limit query values should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(400)
            .query({ limit: "not_a_valid_limit" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
            });
    });
    test("GET:400 Invalid page query should cause an error to be sent", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(400)
            .query({ p: "not_a_valid_page" })
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Query Value");
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
    test("PATCH:200 Should update the requested comment and send the new version on a key of 'comment'", () => {
        return request(app)
            .patch("/api/comments/3")
            .send({ inc_votes: 5 })
            .expect(200)
            .then((response) => {
                const { comment } = response.body;
                expect(comment.comment_id).toBe(3);
                expect(comment.body).toBe(
                    "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works."
                );
                expect(comment.votes).toBe(105);
                expect(comment.author).toBe("icellusedkars");
                expect(comment.article_id).toBe(1);
                expect(typeof comment.created_at).toBe("string");
            });
    });
    test("PATCH:404 If a valid id is given, but it does not exist in the database, an error message should be sent", () => {
        return request(app)
            .patch("/api/comments/9999")
            .send({ inc_votes: 5 })
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("Comment not found");
            });
    });
    test("PATCH:400 If an invalid id is given, an error message should be sent", () => {
        return request(app)
            .patch("/api/comments/fake_id")
            .send({ inc_votes: 5 })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
            });
    });
    test("PATCH:400 If an invalid request body is given, an error message should be sent", () => {
        return request(app)
            .patch("/api/comments/3")
            .send({ wrong_key: 5 })
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request Body");
            });
    });
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

describe("/api/users/:username", () => {
    test("GET:200 Should send the requested user object on a key of user", () => {
        return request(app)
            .get("/api/users/lurker")
            .expect(200)
            .then((response) => {
                const { user } = response.body;
                expect(user.username).toBe("lurker");
                expect(user.name).toBe("do_nothing");
                expect(user.avatar_url).toBe(
                    "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png"
                );
            });
    });
    test("GET:404 If the requested username is not in the database, an error should be sent", () => {
        return request(app)
            .get("/api/users/waldo")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("User not found");
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
