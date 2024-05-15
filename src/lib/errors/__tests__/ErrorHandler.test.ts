import request from "supertest";
import app from "@/app";

describe("ErrorHandler middleware", () => {
    test("It should return a 404 error", async () => {
        const response = await request(app).get("/404");
        expect(response.statusCode).toBe(404);
    });
    test("It should return an Unknow error", async () => {
        const response = await request(app).get("/error");
        expect(response.body.message).toBe(
            "Something went wrong in the server."
        );
    });
});
