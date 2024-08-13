import cache from "@/lib/cache";
import dataAccess from "./resource.dataAccess";
import { ResourceResponse, ResourceRequest } from "./resourceSchema";

export type ResourcePaginationResponse = {
    resources: ResourceResponse[];
    pagination: {
        amount: number;
        pages: number;
    };
};

/**
 * Generates a cache key for a resource.
 * @param key - The key to be included in the cache key.
 * @returns The generated cache key.
 */
const generateCacheKey = (key: string) => {
    return `resource-${key}`;
};

const MULTIPLE_RESOURCES_KEY = "resources_and_pagination*";

/**
 * Creates a new resource and caches the result.
 * @param resource - The resource data to create.
 * @returns The created resource or null if creation failed.
 */
const createResource = async (
    resource: ResourceRequest
): Promise<ResourceResponse | null> => {
    // Store Resource in database
    const result = await dataAccess.createResource(resource);

    // most likely the result will always be bigger than 0
    if (result.length > 0) {
        const newResource = result[0];

        const cacheKey = generateCacheKey(newResource.id.toString());

        // Do not use `await` here since the user doesn't need to wait for this operation to finish
        cache.set(cacheKey, JSON.stringify(newResource));
        cache.deleteByPattern(MULTIPLE_RESOURCES_KEY);

        return newResource;
    }

    // Most likely will never happen
    return null;
};

/**
 * Retrieves resources with pagination and caching.
 * @param page - The page number to retrieve.
 * @param amount - The number of resources per page.
 * @param name - The name to filter resources by.
 * @returns The resources and pagination information.
 */
const getResources = async (
    page: number,
    amount: number,
    name: string
): Promise<ResourcePaginationResponse> => {
    // * Check if it exits in cache first

    // Remove the '*' at the end
    const pattern = MULTIPLE_RESOURCES_KEY.substring(
        0,
        MULTIPLE_RESOURCES_KEY.length - 1
    );
    const cacheKey = `${pattern}-${page}-${amount}-${name}`;

    const cachedData: string | null = await cache.get(cacheKey);
    if (cachedData && cachedData !== "null") {
        return JSON.parse(cachedData) as ResourcePaginationResponse;
    }

    // * Else: Get data from database, store in cache, and return

    // Since the lowest allowed page is 1 for better user experience, and nicer math
    const newPage = page - 1;

    // Execute queries in parallel
    const [numberOfRows, results] = await Promise.all([
        dataAccess.getNumberOfRows(name),
        dataAccess.getResources(amount, newPage * amount, name),
    ]);

    // Most likely the array will never be empty
    let count = 0;
    if (numberOfRows.length > 0) {
        count = numberOfRows[0].count;
    }

    const resources = {
        resources: results,
        pagination: {
            amount: count,
            pages: Math.ceil(count / amount),
        },
    };

    // Do not use `await` here since the user doesn't need to wait for this operation to finish
    cache.set(cacheKey, JSON.stringify(resources));

    return resources;
};

/**
 * Retrieves a resource by its ID, using cache if available.
 * @param id - The ID of the resource to retrieve.
 * @returns The resource or null if not found.
 */
const getResourceById = async (
    id: number
): Promise<ResourceResponse | null> => {
    // Check cache
    const cacheKey = generateCacheKey(id.toString());

    const cachedData: string | null = await cache.get(cacheKey);
    if (cachedData && cachedData !== "null") {
        return JSON.parse(cachedData) as ResourceResponse;
    }

    // Get data from database and then cache the result
    const data = await dataAccess.getResourceById(id);

    // Do not use `await` here since the user doesn't need to wait for this operation to finish
    cache.set(cacheKey, JSON.stringify(data));

    return data;
};

/**
 * Updates a resource by its ID and caches the updated result.
 * @param resourceId - The ID of the resource to update.
 * @param resource - The new resource data.
 * @returns The updated resource or null if update failed.
 */
const updateResourceById = async (
    resourceId: number,
    resource: ResourceRequest
) => {
    // Update resource in database
    const result = await dataAccess.updateResource(resourceId, resource);

    // most likely the result will always be bigger than 0
    if (result.length > 0) {
        const updatedResource = result[0];

        const cacheKey = generateCacheKey(updatedResource.id.toString());

        // Do not use `await` here since the user doesn't need to wait for this operation to finish
        cache.set(cacheKey, JSON.stringify(updatedResource));
        cache.deleteByPattern(MULTIPLE_RESOURCES_KEY);

        return updatedResource;
    }

    // Most likely will never happen
    return null;
};

/**
 * Deletes a resource by its ID and removes the relevant cache entries.
 * @param id - The ID of the resource to delete.
 */
const deleteResourceById = async (id: number) => {
    await dataAccess.deleteResource(id);

    const cacheKey = generateCacheKey(id.toString());

    // Do not use `await` here since the user doesn't need to wait for this operation to finish
    cache.del(cacheKey);
    cache.deleteByPattern(MULTIPLE_RESOURCES_KEY);
};

const resourceService = {
    createResource,
    getResources,
    getResourceById,
    updateResourceById,
    deleteResourceById,
};

export default resourceService;
