const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const { describe, test } = require("@jest/globals");
const endpoints = require("../endpoints.json");

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
                expect(typeof article.article_id).toBe("number");
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
    test.only("GET:400 If an invalid id is given, an arror message should be sent", () => {
        return request(app)
            .get("/api/articles/string")
            .expect(400)
            .then((response) => {
                expect(response.body.msg).toBe("Invalid Request");
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
