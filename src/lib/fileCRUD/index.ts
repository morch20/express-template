import * as fs from "fs-extra";
import * as path from "node:path";
import * as lockfile from "proper-lockfile";
import httpStatus from "http-status";
import { AppError } from "../errors";

export default class FileCRUD {
    /**
     * Initializes a new instance of the FileCRUD class.
     * Ensures the specified directory exists.
     * @param directory - The directory where files will be managed.
     */
    constructor(private directory: string) {
        // Ensure the directory exists
        fs.ensureDirSync(this.directory);
    }

    /**
     * Constructs the full file path for a given file name.
     * @param fileName - The name of the file.
     * @returns The full path to the file.
     */
    private getFilePath(fileName: string): string {
        return path.join(this.directory, fileName);
    }

    /**
     * Executes a callback function with a lock on the specified file.
     * Ensures that file operations are performed safely without race conditions.
     * @param filePath - The path of the file to lock.
     * @param callback - The async function to execute while the file is locked.
     * @param errorMessage - The error message to throw if the callback fails.
     * @returns A promise that resolves with the result of the callback or void.
     */
    private static async withLock(
        filePath: string,
        callback: () => Promise<void | string>,
        errorMessage: string
    ): Promise<void | string> {
        const release = await lockfile.lock(filePath);
        try {
            return await callback();
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                errorMessage,
                httpStatus.INTERNAL_SERVER_ERROR,
                true
            );
        } finally {
            await release();
        }
    }

    /**
     * Creates a new file with the specified content.
     * Ensures the file does not already exist.
     * @param fileName - The name of the file to create.
     * @param content - The content to write to the file.
     * @throws AppError if the file already exists or if the operation fails.
     */
    async createFile(fileName: string, content: string): Promise<void> {
        const filePath = this.getFilePath(fileName);

        await FileCRUD.withLock(
            filePath,
            async () => {
                if (await fs.pathExists(filePath)) {
                    throw new AppError(
                        `File ${fileName} already exists`,
                        httpStatus.BAD_REQUEST
                    );
                }
                await fs.writeFile(filePath, content);
            },
            `Failed to create file: ${fileName}`
        );
    }

    /**
     * Reads the content of the specified file.
     * @param fileName - The name of the file to read.
     * @returns A promise that resolves with the file content as a string.
     * @throws AppError if the file does not exist or if the operation fails.
     */
    async readFile(fileName: string): Promise<string> {
        const filePath = this.getFilePath(fileName);

        return (await FileCRUD.withLock(
            filePath,
            async () => {
                if (!(await fs.pathExists(filePath))) {
                    throw new AppError(
                        `File ${fileName} does not exist`,
                        httpStatus.BAD_REQUEST
                    );
                }
                return fs.readFile(filePath, "utf8");
            },
            `Failed to read file: ${fileName}`
        )) as string;
    }

    /**
     * Updates the content of the specified file.
     * Ensures the file exists before updating.
     * @param fileName - The name of the file to update.
     * @param content - The new content to write to the file.
     * @throws AppError if the file does not exist or if the operation fails.
     */
    async updateFile(fileName: string, content: string): Promise<void> {
        const filePath = this.getFilePath(fileName);
        await FileCRUD.withLock(
            filePath,
            async () => {
                if (!(await fs.pathExists(filePath))) {
                    throw new AppError(
                        `File ${fileName} does not exist`,
                        httpStatus.BAD_REQUEST
                    );
                }
                await fs.writeFile(filePath, content);
            },
            `Failed to updated file: ${fileName}`
        );
    }

    /**
     * Deletes the specified file.
     * Ensures the file exists before deleting.
     * @param fileName - The name of the file to delete.
     * @throws AppError if the file does not exist or if the operation fails.
     */
    async deleteFile(fileName: string): Promise<void> {
        const filePath = this.getFilePath(fileName);
        await FileCRUD.withLock(
            filePath,
            async () => {
                if (!(await fs.pathExists(filePath))) {
                    throw new AppError(
                        `File ${fileName} does not exist`,
                        httpStatus.BAD_REQUEST
                    );
                }
                await fs.remove(filePath);
            },
            `Failed to delete file: ${fileName}`
        );
    }
}
