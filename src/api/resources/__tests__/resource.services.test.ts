import cache from "@/lib/cache";
import resourceService, {
    ResourcePaginationResponse,
} from "../resource.services";
import dataAccess from "../resource.dataAccess";
import { ResourceRequest, ResourceResponse } from "../resourceSchema";

jest.mock("@/lib/cache");
jest.mock("../resource.dataAccess");
jest.mock("@/lib/utils/functions");
jest.mock("@/lib/logger/Logger");

describe("resourceService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createResource", () => {
        it("should create a new resource, cache it, and invalidate relevant caches", async () => {
            const resource: ResourceRequest = { name: "New Resource" } as any;
            const createdResource: ResourceResponse = {
                id: 1,
                name: "New Resource",
            } as any;
            (dataAccess.createResource as jest.Mock).mockResolvedValue([
                createdResource,
            ]);

            const result = await resourceService.createResource(resource);

            // Create Resource
            expect(result).toEqual(createdResource);

            // Cache
            expect(cache.set).toHaveBeenCalledWith(
                "resource-1",
                JSON.stringify(createdResource)
            );
            expect(cache.deleteByPattern).toHaveBeenCalledWith(
                "resources_and_pagination*"
            );
        });

        it("should return null if resource creation fails", async () => {
            const resource: ResourceRequest = { name: "New Resource" } as any;
            (dataAccess.createResource as jest.Mock).mockResolvedValue([]);

            const result = await resourceService.createResource(resource);

            expect(result).toBeNull();
        });
    });

    describe("getResources", () => {
        it("should fetch resources from database if not cached, cache the result, and return them", async () => {
            const dbResources: ResourceResponse[] = [
                { id: 1, name: "Resource" },
            ] as any;
            const dbRowCount = [{ count: 1 }];
            (dataAccess.getNumberOfRows as jest.Mock).mockResolvedValue(
                dbRowCount
            );
            (dataAccess.getResources as jest.Mock).mockResolvedValue(
                dbResources
            );

            const result = await resourceService.getResources(
                1,
                10,
                "Resource"
            );

            const expectedResponse: ResourcePaginationResponse = {
                resources: dbResources,
                pagination: { amount: 1, pages: 1 },
            };

            expect(result).toEqual(expectedResponse);
            expect(cache.set).toHaveBeenCalledWith(
                "resources_and_pagination-1-10-Resource",
                JSON.stringify(expectedResponse)
            );
        });

        it("should return cached resources if available", async () => {
            const cachedData: ResourcePaginationResponse = {
                resources: [{ id: 1, name: "Resource" }],
                pagination: { amount: 1, pages: 1 },
            } as any;
            (cache.get as jest.Mock).mockResolvedValue(
                JSON.stringify(cachedData)
            );

            const result = await resourceService.getResources(
                1,
                10,
                "Resource"
            );

            expect(result).toEqual(cachedData);
            expect(cache.get).toHaveBeenCalledWith(
                "resources_and_pagination-1-10-Resource"
            );
        });
    });

    describe("getResourceById", () => {
        it("should return cached resource if available", async () => {
            const cachedResource: ResourceResponse = {
                id: 1,
                name: "Resource",
            } as any;
            (cache.get as jest.Mock).mockResolvedValue(
                JSON.stringify(cachedResource)
            );

            const result = await resourceService.getResourceById(1);

            expect(result).toEqual(cachedResource);
            expect(cache.get).toHaveBeenCalledWith("resource-1");
        });

        it("should fetch resource from database if not cached, cache the result, and return it", async () => {
            const dbResource: ResourceResponse = {
                id: 1,
                name: "Resource",
            } as any;
            (cache.get as jest.Mock).mockReturnValue("null");
            (dataAccess.getResourceById as jest.Mock).mockResolvedValue(
                dbResource
            );

            const result = await resourceService.getResourceById(1);

            expect(result).toEqual(dbResource);
            expect(cache.set).toHaveBeenCalledWith(
                "resource-1",
                JSON.stringify(dbResource)
            );
        });
    });

    describe("updateResourceById", () => {
        it("should update the resource, cache the updated resource, and invalidate relevant caches", async () => {
            const resourceId = 1;
            const resourceUpdate: ResourceRequest = {
                name: "Updated Resource",
            } as any;
            const updatedResource: ResourceResponse = {
                id: 1,
                name: "Updated Resource",
            } as any;
            (dataAccess.updateResource as jest.Mock).mockResolvedValue([
                updatedResource,
            ]);

            const result = await resourceService.updateResourceById(
                resourceId,
                resourceUpdate
            );

            // Update resource
            expect(result).toEqual(updatedResource);

            // Update cache
            expect(cache.set).toHaveBeenCalledWith(
                "resource-1",
                JSON.stringify(updatedResource)
            );
            expect(cache.deleteByPattern).toHaveBeenCalledWith(
                "resources_and_pagination*"
            );
        });

        it("should return null if resource update fails", async () => {
            const resourceId = 1;
            const resourceUpdate: ResourceRequest = {
                name: "Updated Resource",
            } as any;
            (dataAccess.updateResource as jest.Mock).mockResolvedValue([]);

            const result = await resourceService.updateResourceById(
                resourceId,
                resourceUpdate
            );

            expect(result).toBeNull();
        });
    });

    describe("deleteResourceById", () => {
        it("should delete the resource, and invalidate relevant caches", async () => {
            const resourceId = 1;
            (dataAccess.deleteResource as jest.Mock).mockResolvedValue(
                undefined
            );

            await resourceService.deleteResourceById(resourceId);

            expect(cache.del).toHaveBeenCalledWith("resource-1");
            expect(cache.deleteByPattern).toHaveBeenCalledWith(
                "resources_and_pagination*"
            );
        });
    });
});
