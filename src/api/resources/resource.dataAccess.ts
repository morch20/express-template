import db from "@/db";
import { resource } from "@/db/schema";
import { count, eq, ilike } from "drizzle-orm";
import { PostgresError } from "postgres";
import { AppError } from "@/lib/errors";
import httpStatus from "http-status";
import { ResourceRequest, ResourceResponse } from "./resourceSchema";

// type TransactionClient = PgTransaction<
//     PostgresJsQueryResultHKT,
//     typeof schema,
//     ExtractTablesWithRelations<typeof schema>
// >;

// const transaction = async <T>(
//     callback: (tx: TransactionClient) => Promise<T>
// ): Promise<T> => {
//     const value = await db.transaction(async (tx) => {
//         const callbackValue = await callback(tx);
//         return callbackValue;
//     });

//     return value;
// };

// const deleteResourceTEST = async (id: number, dbClient = db) => {
//     await dbClient.delete(resource).where(eq(resource.id, id));
// };

// transaction(async (tx) => {
//     const result = await deleteResourceTEST(2, tx);
//     return result;
// })

/**
 * Fetches resources with optional name filtering, pagination support.
 * @param limit - Maximum number of resources to fetch.
 * @param offset - Number of resources to skip.
 * @param name - Optional name filter to search resources by name.
 * @returns A promise that resolves to an array of ResourceResponse objects.
 */
const getResources = async (
    limit: number,
    offset: number,
    name = ""
): Promise<ResourceResponse[]> => {
    // TODO: Get filters of orderBy

    // Initialize the query builder
    let query = db
        .select()
        .from(resource)
        .limit(limit)
        .offset(offset)
        .$dynamic();

    // Add a where clause if name is not empty
    if (name !== "") {
        query = query.where(ilike(resource.name, `%${name}%`));
    }

    // Execute the query
    const resources: ResourceResponse[] = await query;
    return resources;
};

/**
 * Gets the total number of resources, optionally filtered by name.
 * @param name - Optional name filter to count resources by name.
 * @returns A promise that resolves to the count of resources.
 */
const getNumberOfRows = async (name = "") => {
    // TODO: Get filters of orderBy

    // Initialize the query builder
    let query = db.select({ count: count() }).from(resource).$dynamic();

    // Add a where clause if name is not empty
    if (name !== "") {
        query = query.where(ilike(resource.name, `%${name}%`));
    }

    // Execute the query
    const amount = await query;
    return amount;
};

/**
 * Fetches a single resource by its ID.
 * @param id - The ID of the resource to fetch.
 * @returns A promise that resolves to the resource if found, or null if not.
 */
const getResourceById = async (id: number) => {
    const resourceResult = await db
        .select()
        .from(resource)
        .where(eq(resource.id, id));

    if (resourceResult.length === 0) return null;
    return resourceResult[0];
};

/**
 * Creates a new resource.
 * @param values - The values of the resource to create.
 * @returns A promise that resolves to the result of the insert operation.
 * @throws An AppError if a duplicate key error occurs.
 */
const createResource = async (values: ResourceRequest) => {
    try {
        const result = await db.insert(resource).values(values).returning();
        return result;
    } catch (error) {
        if (error instanceof PostgresError && error.code === "23505") {
            throw new AppError("Duplicate key", httpStatus.BAD_REQUEST, false, {
                name: "Can not have an already existing name",
            });
        } else {
            throw error;
        }
    }
};

/**
 * Updates an existing resource by its ID.
 * @param id - The ID of the resource to update.
 * @param values - The new values for the resource.
 * @returns A promise that resolves to the result of the update operation.
 */
const updateResource = async (id: number, values: ResourceRequest) => {
    try {
        const result = await db
            .update(resource)
            .set(values)
            .where(eq(resource.id, id))
            .returning();
        return result;
    } catch (error) {
        if (error instanceof PostgresError && error.code === "23505") {
            throw new AppError("Duplicate key", httpStatus.BAD_REQUEST, false, {
                name: "Can not have an already existing name",
            });
        } else {
            throw error;
        }
    }
};

/**
 * Deletes a resource by its ID.
 * @param id - The ID of the resource to delete.
 * @returns A promise that resolves when the delete operation is complete.
 */
const deleteResource = async (id: number) => {
    await db.delete(resource).where(eq(resource.id, id));
};

const dataAccess = {
    getResources,
    getResourceById,
    deleteResource,
    createResource,
    updateResource,
    getNumberOfRows,
};

export default dataAccess;
