// import httpStatus from "http-status";
import { PostgresError } from "postgres";
import db from "@/db";
// import { resource } from "@/db/schema";
import { AppError } from "@/lib/errors";
import dataAccess from "../resource.dataAccess";
import { ResourceRequest, ResourceResponse } from "../resourceSchema";

// Mock the db object
jest.mock("@/db");

const mockedDb = db as jest.Mocked<typeof db>;

describe("dataAccess", () => {
    describe("getResources", () => {
        it("should fetch resources with no name filter", async () => {
            const limit = 10;
            const offset = 0;
            const mockResources: ResourceResponse[] = [
                { id: 1, name: "Resource 1" } as any,
            ];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                $dynamic: jest.fn().mockReturnValue(mockResources),
                // where: jest.fn().mockResolvedValue(mockResources),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const resources = await dataAccess.getResources(limit, offset);
            expect(resources).toEqual(mockResources);
        });

        it("should fetch resources with a name filter", async () => {
            const limit = 10;
            const offset = 0;
            const name = "Resource";
            const mockResources: ResourceResponse[] = [
                { id: 1, name: "Resource 1" } as any,
            ];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                $dynamic: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(mockResources),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const resources = await dataAccess.getResources(
                limit,
                offset,
                name
            );
            expect(resources).toEqual(mockResources);
        });
    });

    describe("getNumberOfRows", () => {
        it("should return the total number of rows with no name filter", async () => {
            const mockCount = [{ count: 5 }];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                $dynamic: jest.fn().mockResolvedValue(mockCount),
                // where: jest.fn().mockResolvedValue(mockCount),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const count = await dataAccess.getNumberOfRows();
            expect(count).toEqual(mockCount);
        });

        it("should return the total number of rows with a name filter", async () => {
            const name = "Resource";
            const mockCount = [{ count: 3 }];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                $dynamic: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(mockCount),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const count = await dataAccess.getNumberOfRows(name);
            expect(count).toEqual(mockCount);
        });
    });

    describe("getResourceById", () => {
        it("should return a resource by its ID", async () => {
            const id = 1;
            const mockResource = [{ id: 1, name: "Resource 1" } as any];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(mockResource),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const resource = await dataAccess.getResourceById(id);
            expect(resource).toEqual(mockResource[0]);
        });

        it("should return null if the resource is not found", async () => {
            const id = 1;
            const mockResource: any[] = [];

            // Mocking the query chain
            const mockQuery = {
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockResolvedValue(mockResource),
            };
            mockedDb.select.mockReturnValue(mockQuery as any);

            const resource = await dataAccess.getResourceById(id);
            expect(resource).toBeNull();
        });
    });

    describe("createResource", () => {
        it("should create a new resource", async () => {
            const values: ResourceRequest = { name: "New Resource" } as any;
            const mockResult = { id: 1, ...values };

            // Mocking the query chain
            const mockQuery = {
                values: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue(mockResult),
            };
            mockedDb.insert.mockReturnValue(mockQuery as any);

            const result = await dataAccess.createResource(values);
            expect(result).toEqual(mockResult);
        });

        it("should throw an AppError on duplicate key", async () => {
            const values: ResourceRequest = { name: "New Resource" } as any;
            const mockError = new PostgresError(
                'duplicate key value violates unique constraint "resource_name_unique"'
            );
            mockError.code = "23505";
            mockedDb.insert.mockImplementationOnce(() => {
                throw mockError;
            });

            await expect(dataAccess.createResource(values)).rejects.toThrow(
                AppError
            );
        });

        it("should throw any error", async () => {
            const values: ResourceRequest = {
                name: "New Resource",
            } as any;
            const mockError = new Error("Error");
            mockedDb.insert.mockImplementationOnce(() => {
                throw mockError;
            });

            await expect(dataAccess.createResource(values)).rejects.toThrow(
                Error
            );
        });
    });

    describe("updateResource", () => {
        it("should update an existing resource", async () => {
            const id = 1;
            const values: ResourceRequest = { name: "Updated Resource" } as any;
            const mockResult = { id, ...values };

            // Mocking the query chain
            const mockQuery = {
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue(mockResult),
            };
            mockedDb.update.mockReturnValue(mockQuery as any);

            const result = await dataAccess.updateResource(id, values);
            expect(result).toEqual(mockResult);
        });

        it("should throw an AppError on duplicate key", async () => {
            const id = 1;
            const values: ResourceRequest = { name: "Updated Resource" } as any;
            const mockError = new PostgresError(
                'duplicate key value violates unique constraint "resource_name_unique"'
            );
            mockError.code = "23505";
            mockedDb.update.mockImplementationOnce(() => {
                throw mockError;
            });

            await expect(dataAccess.updateResource(id, values)).rejects.toThrow(
                AppError
            );
        });

        it("should throw any error", async () => {
            const id = 1;
            const values: ResourceRequest = {
                name: "Updated Resource",
            } as any;
            const mockError = new Error("Error");
            mockedDb.update.mockImplementationOnce(() => {
                throw mockError;
            });

            await expect(dataAccess.updateResource(id, values)).rejects.toThrow(
                Error
            );
        });
    });

    describe("deleteResource", () => {
        it("should delete a resource by its ID", async () => {
            const id = 1;

            // Mocking the query chain
            const mockQuery = {
                where: jest.fn().mockResolvedValue(undefined),
            };
            // eslint-disable-next-line drizzle/enforce-delete-with-where
            mockedDb.delete.mockReturnValue(mockQuery as any);

            await expect(
                dataAccess.deleteResource(id)
            ).resolves.toBeUndefined();
        });
    });
});
