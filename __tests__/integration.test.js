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
                expect(body).toEqual(endpoints);
            });
    });
});

describe("api/topics", () => {
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
