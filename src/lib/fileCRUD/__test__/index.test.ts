import fs from "fs-extra";
import { logger } from "@/lib/logger";
import FileCRUD from "..";

describe("FileCRUD", () => {
    let fileCRUD: FileCRUD;
    const testDir = "./mock";

    beforeAll(async () => {
        await fs.ensureDir(testDir);
        fileCRUD = new FileCRUD(testDir);
    });

    afterAll(async () => {
        await fs.remove(testDir);
    });

    // Test case for successful execution within lock
    it("should execute callback within lock", async () => {
        const fileName = "testFile.txt";
        const content = "Hello, World!";

        const filePath = `${testDir}/${fileName}`;

        // Create the file first
        await fs.writeFile(filePath, content);

        const result = await FileCRUD.withLock(filePath, async () => {
            // Read the file content within the lock
            const fileContent = await fs.readFile(filePath, "utf8");
            return fileContent.trim();
        });

        expect(result).toBe(content);
    });

    // Test case for handling errors within lock
    it("should handle errors within lock and log", async () => {
        const fileName = "testFile.txt";

        const filePath = `${testDir}/${fileName}`;

        const error = new Error("Simulated error");

        // Mock logger.error to capture log messages
        const mockLoggerError = jest
            .spyOn(logger, "error")
            .mockImplementation(() => {});

        try {
            // Attempt to acquire lock on non-existing file, should throw an error
            await FileCRUD.withLock(filePath, async () => {
                throw error;
            });
        } catch (err) {
            // Check if the error was logged
            // eslint-disable-next-line jest/no-conditional-expect
            expect(mockLoggerError).toHaveBeenCalledWith(
                "Something went wrong locking file",
                error
            );
        }

        // Restore the original logger.error implementation
        mockLoggerError.mockRestore();
    });

    // Test case for file creation
    it("should create a file", async () => {
        const fileName = "testFile.txt";
        const content = "Hello, World!";

        const result = await fileCRUD.createFile(fileName, content);
        expect(result).toBe("success");

        const filePath = `${testDir}/${fileName}`;
        const fileExists = await fs.pathExists(filePath);
        expect(fileExists).toBe(true);

        const fileContent = await fs.readFile(filePath, "utf8");
        expect(fileContent).toBe(content);
    });

    // Test case for reading a file
    it("should read a file", async () => {
        const fileName = "testFile.txt";
        const expectedContent = "Hello, World!";

        const result = await fileCRUD.readFile(fileName);
        expect(result).toBe(expectedContent);
    });

    // Test case for updating a file
    it("should update a file", async () => {
        const fileName = "testFile.txt";
        const newContent = "Updated content";

        const result = await fileCRUD.updateFile(fileName, newContent);
        expect(result).toBe("success");

        const filePath = `${testDir}/${fileName}`;
        const fileContent = await fs.readFile(filePath, "utf8");
        expect(fileContent).toBe(newContent);
    });

    // Test case for deleting a file
    it("should delete a file", async () => {
        const fileName = "testFile.txt";

        const result = await fileCRUD.deleteFile(fileName);
        expect(result).toBe("success");

        const filePath = `${testDir}/${fileName}`;
        const fileExists = await fs.pathExists(filePath);
        expect(fileExists).toBe(false);
    });

    // Test case for handling non-existing files
    it("should return null for non-existing file operations", async () => {
        const nonExistingFileName = "nonExistingFile.txt";

        const readResult = await fileCRUD.readFile(nonExistingFileName);
        expect(readResult).toBeNull();

        const updateResult = await fileCRUD.updateFile(
            nonExistingFileName,
            "Update"
        );
        expect(updateResult).toBeNull();

        const deleteResult = await fileCRUD.deleteFile(nonExistingFileName);
        expect(deleteResult).toBeNull();
    });
});
