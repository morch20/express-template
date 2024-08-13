import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { AppError } from "@/lib/errors";
import resourceController from "../resources.controller";
import resourceService from "../resource.services";

jest.mock("../resource.services"); // Mock the resourceService

const app = express();
app.use(express.json());
app.post("/resources", resourceController.createResource);
app.get("/resources", resourceController.getResources);
app.get("/resources/:id", resourceController.getResource);
app.put("/resources/:id", resourceController.updateResource);
// eslint-disable-next-line drizzle/enforce-delete-with-where
app.delete("/resources/:id", resourceController.deleteResource);

// Custom error handling middleware for the tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        res.status(err.getStatusCode()).json({ message: err.message });
    } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Internal Server Error",
        });
    }
});

describe("resourceController", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createResource", () => {
        it("should create a resource and return it with status 201", async () => {
            const newResource = { id: 1, name: "New Resource" };
            (resourceService.createResource as jest.Mock).mockResolvedValue(
                newResource
            );

            const response = await request(app)
                .post("/resources")
                .send({ name: "New Resource" });

            expect(response.status).toBe(httpStatus.CREATED);
            expect(response.body).toEqual(newResource);
            expect(resourceService.createResource).toHaveBeenCalledWith({
                name: "New Resource",
            });
        });

        it("should return 500 if resource creation fails", async () => {
            (resourceService.createResource as jest.Mock).mockResolvedValue(
                null
            );

            const response = await request(app)
                .post("/resources")
                .send({ name: "New Resource" });

            expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body.message).toBe("Error creating resource");
        });
    });

    describe("getResources", () => {
        it("should return resources with status 200", async () => {
            const resources = {
                resources: [{ id: 1, name: "Resource" }],
                pagination: { amount: 1, pages: 1 },
            };
            (resourceService.getResources as jest.Mock).mockResolvedValue(
                resources
            );

            const response = await request(app)
                .get("/resources")
                .query({ page: 1, amount: 10, name: "Resource" });

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(resources);
            expect(resourceService.getResources).toHaveBeenCalledWith(
                1,
                10,
                "Resource"
            );
        });
    });

    describe("getResource", () => {
        it("should return a resource with status 200", async () => {
            const resource = { id: 1, name: "Resource" };
            (resourceService.getResourceById as jest.Mock).mockResolvedValue(
                resource
            );

            const response = await request(app).get("/resources/1");

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(resource);
            expect(resourceService.getResourceById).toHaveBeenCalledWith(1);
        });

        it("should return 404 if resource not found", async () => {
            (resourceService.getResourceById as jest.Mock).mockResolvedValue(
                null
            );

            const response = await request(app).get("/resources/1");

            expect(response.status).toBe(httpStatus.NOT_FOUND);
            expect(response.body.message).toBe("Resource not found");
        });
    });

    describe("updateResource", () => {
        it("should update a resource and return it with status 200", async () => {
            const updatedResource = { id: 1, name: "Updated Resource" };
            (resourceService.updateResourceById as jest.Mock).mockResolvedValue(
                updatedResource
            );

            const response = await request(app)
                .put("/resources/1")
                .send({ name: "Updated Resource" });

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(updatedResource);
            expect(resourceService.updateResourceById).toHaveBeenCalledWith(1, {
                name: "Updated Resource",
            });
        });

        it("should return 500 if resource update fails", async () => {
            (resourceService.updateResourceById as jest.Mock).mockResolvedValue(
                null
            );

            const response = await request(app)
                .put("/resources/1")
                .send({ name: "Updated Resource" });

            expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
            expect(response.body.message).toBe("Error updating resource");
        });
    });

    describe("deleteResource", () => {
        it("should delete a resource and return status 204", async () => {
            (resourceService.deleteResourceById as jest.Mock).mockResolvedValue(
                undefined
            );

            // eslint-disable-next-line drizzle/enforce-delete-with-where
            const response = await request(app).delete("/resources/1");

            expect(response.status).toBe(httpStatus.NO_CONTENT);
            expect(resourceService.deleteResourceById).toHaveBeenCalledWith(1);
        });
    });
});
