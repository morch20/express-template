import * as fs from "fs-extra";
import * as path from "node:path";
import * as lockfile from "proper-lockfile";
import { AppError } from "@/lib/errors";
import httpStatus from "http-status";
import FileCRUD from "..";

jest.mock("fs-extra");
jest.mock("proper-lockfile");

const mockDirectory = "/mock";

describe("FileCRUD", () => {
    let fileCRUD: FileCRUD;

    beforeEach(() => {
        fileCRUD = new FileCRUD(mockDirectory);
        (fs.ensureDirSync as jest.Mock).mockClear();
        (fs.pathExists as jest.Mock).mockClear();
        (fs.writeFile as unknown as jest.Mock).mockClear();
        (fs.readFile as unknown as jest.Mock).mockClear();
        (fs.remove as jest.Mock).mockClear();
        (lockfile.lock as jest.Mock).mockClear();
    });

    describe("withLock", () => {
        it("should execute the callback with the file lock", async () => {
            const filePath = "/mock-directory/test.txt";
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            const callback = jest.fn().mockResolvedValue("callback result");
            const result = await FileCRUD.withLock(
                filePath,
                callback,
                "Error message"
            );

            expect(lockfile.lock).toHaveBeenCalledWith(filePath);
            expect(callback).toHaveBeenCalled();
            expect(result).toBe("callback result");
            expect(release).toHaveBeenCalled();
        });

        it("should release the lock even if the callback throws an error", async () => {
            const filePath = "/mock-directory/test.txt";
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            const callback = jest
                .fn()
                .mockRejectedValue(new Error("Callback error"));

            await expect(
                FileCRUD.withLock(filePath, callback, "Error message")
            ).rejects.toThrow(AppError);

            expect(lockfile.lock).toHaveBeenCalledWith(filePath);
            expect(callback).toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });

        it("should throw the original AppError if the callback throws an AppError", async () => {
            const filePath = "/mock-directory/test.txt";
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            const appError = new AppError(
                "Callback AppError",
                httpStatus.BAD_REQUEST,
                true
            );
            const callback = jest.fn().mockRejectedValue(appError);

            await expect(
                FileCRUD.withLock(filePath, callback, "Error message")
            ).rejects.toThrow(appError);

            expect(lockfile.lock).toHaveBeenCalledWith(filePath);
            expect(callback).toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });

        it("should throw a new AppError if the callback throws a non-AppError", async () => {
            const filePath = "/mock-directory/test.txt";
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            const callback = jest
                .fn()
                .mockRejectedValue(new Error("Callback error"));

            await expect(
                FileCRUD.withLock(filePath, callback, "Error message")
            ).rejects.toThrow(AppError);

            expect(lockfile.lock).toHaveBeenCalledWith(filePath);
            expect(callback).toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });
    });

    describe("createFile", () => {
        it("should create a file with the specified content", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(false);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await fileCRUD.createFile("test.txt", "content");

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt"),
                "content"
            );
            expect(release).toHaveBeenCalled();
        });

        it("should throw an error if the file already exists", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(true);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await expect(
                fileCRUD.createFile("test.txt", "content")
            ).rejects.toThrow(AppError);

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.writeFile).not.toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });
    });

    describe("readFile", () => {
        it("should read the content of the specified file", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(true);
            (fs.readFile as unknown as jest.Mock).mockResolvedValue(
                "file content"
            );
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            const content = await fileCRUD.readFile("test.txt");

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.readFile).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt"),
                "utf8"
            );
            expect(content).toBe("file content");
            expect(release).toHaveBeenCalled();
        });

        it("should throw an error if the file does not exist", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(false);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await expect(fileCRUD.readFile("test.txt")).rejects.toThrow(
                AppError
            );

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.readFile).not.toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });
    });

    describe("updateFile", () => {
        it("should update the content of the specified file", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(true);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await fileCRUD.updateFile("test.txt", "new content");

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt"),
                "new content"
            );
            expect(release).toHaveBeenCalled();
        });

        it("should throw an error if the file does not exist", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(false);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await expect(
                fileCRUD.updateFile("test.txt", "new content")
            ).rejects.toThrow(AppError);

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.writeFile).not.toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });
    });

    describe("deleteFile", () => {
        it("should delete the specified file", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(true);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await fileCRUD.deleteFile("test.txt");

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.remove).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(release).toHaveBeenCalled();
        });

        it("should throw an error if the file does not exist", async () => {
            (fs.pathExists as jest.Mock).mockResolvedValue(false);
            const release = jest.fn();
            (lockfile.lock as jest.Mock).mockResolvedValue(release);

            await expect(fileCRUD.deleteFile("test.txt")).rejects.toThrow(
                AppError
            );

            expect(fs.pathExists).toHaveBeenCalledWith(
                path.join(mockDirectory, "test.txt")
            );
            expect(fs.remove).not.toHaveBeenCalled();
            expect(release).toHaveBeenCalled();
        });
    });
});
