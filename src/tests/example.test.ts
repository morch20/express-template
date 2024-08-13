import request from "supertest";
import app from "@/app";

describe("Example test", () => {
    test("It should response the GET method and return 500", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(500);
    });
});
