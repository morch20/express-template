/* eslint-disable no-await-in-loop */
import request from "supertest";
import express from "express";
import rateLimiter from "../rateLimiter";

const app = express();

// Apply the rate limiter middleware to all requests
app.use(rateLimiter);

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

describe("Rate Limiter Middleware", () => {
    test("It should allow up to 20 requests within the rate limit", async () => {
        // Make 19 requests
        for (let i = 0; i < 19; i += 1) {
            await request(app).get("/");
        }

        // Make one more request, should still be allowed
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });

    test("It should return 429 after exceeding the rate limit", async () => {
        // Make 20 requests
        for (let i = 0; i < 20; i += 1) {
            await request(app).get("/");
        }

        // Make one more request, should return 429
        const response = await request(app).get("/");
        expect(response.status).toBe(429);
    });
});
