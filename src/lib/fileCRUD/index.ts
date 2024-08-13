import * as fs from "fs-extra";
import * as path from "node:path";
import * as lockfile from "proper-lockfile";
import { logger } from "../logger";

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
     * @param filePath - The path of the file to lock. The file must exist.
     * @param callback - The async function to execute while the file is locked.
     * @param errorMessage - The error message to throw if the callback fails.
     * @returns A promise that resolves with the result of the callback or void.
     */
    public static async withLock(
        filePath: string,
        callback: () => Promise<null | string>
    ): Promise<null | string> {
        const release = await lockfile.lock(filePath);
        try {
            return await callback();
        } catch (error) {
            logger.error("Something went wrong locking file", error as object);
            return null;
        } finally {
            await release();
        }
    }

    /**
     * Creates a new file with the specified content, replacing the file if it already exists.
     * @param fileName - The name of the file to create.
     * @param content - The content to write to the file.
     * @returns A string "success" if file created successfully or null otherwise.
     */
    async createFile(
        fileName: string,
        content: string
    ): Promise<null | string> {
        const filePath = this.getFilePath(fileName);

        // Ensure the file exists before attempting to create the file
        // Otherwise the file lock will throw an error since there is not file to lock 🤦
        await fs.ensureFile(filePath);

        const response = await FileCRUD.withLock(filePath, async () => {
            await fs.writeFile(filePath, content);
            return "success";
        });

        return response;
    }

    /**
     * Reads the content of the specified file.
     * @param fileName - The name of the file to read.
     * @returns A promise that resolves with the file content as a string or null if file doesn't exit.
     */
    async readFile(fileName: string): Promise<null | string> {
        const filePath = this.getFilePath(fileName);

        // Return null if file does not exit
        // Otherwise the file lock will throw an error since there is not file to lock 🤦
        if (!(await fs.pathExists(filePath))) return null;

        const response = await FileCRUD.withLock(filePath, async () => {
            const content = await fs.readFile(filePath, "utf8");
            return content;
        });

        return response;
    }

    /**
     * Updates the content of the specified file.
     * Ensures the file exists before updating.
     * @param fileName - The name of the file to update.
     * @param content - The new content to write to the file.
     * @returns A string "success" if file updated successfully or null otherwise.
     */
    async updateFile(
        fileName: string,
        content: string
    ): Promise<null | string> {
        const filePath = this.getFilePath(fileName);

        // Return null if file does not exit
        // Otherwise the file lock will throw an error since there is not file to lock 🤦
        if (!(await fs.pathExists(filePath))) return null;

        const response = await FileCRUD.withLock(filePath, async () => {
            await fs.writeFile(filePath, content);
            return "success";
        });

        return response;
    }

    /**
     * Deletes the specified file.
     * Ensures the file exists before deleting.
     * @param fileName - The name of the file to delete.
     * @returns A string "success" if file updated successfully or null otherwise.
     */
    async deleteFile(fileName: string): Promise<null | string> {
        const filePath = this.getFilePath(fileName);

        // Return null if file does not exit
        // Otherwise the file lock will throw an error since there is not file to lock 🤦
        if (!(await fs.pathExists(filePath))) return null;

        const response = await FileCRUD.withLock(filePath, async () => {
            await fs.remove(filePath);
            return "success";
        });

        return response;
    }
}
