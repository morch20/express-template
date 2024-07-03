import { Server as SocketIOServer, Socket as SocketIOClient } from "socket.io";
import http from "http";
import { logger } from "@/lib/logger";
import Socket from "../Socket"; // Adjust the import path

jest.mock("socket.io");
jest.mock("http");
jest.mock("@/lib/logger");

describe("Socket class", () => {
    let mockServer: http.Server;
    let mockSocketServer: jest.Mocked<SocketIOServer>;
    let socketInstance: Socket;

    beforeEach(() => {
        mockServer = new http.Server();
        mockSocketServer = new SocketIOServer(
            mockServer
        ) as jest.Mocked<SocketIOServer>;
        (SocketIOServer as unknown as jest.Mock).mockReturnValue(
            mockSocketServer
        );

        socketInstance = new Socket(mockServer);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should initialize the Socket.IO server", () => {
        expect(SocketIOServer).toHaveBeenCalledWith(mockServer);
    });

    it("should initialize default socket event listeners", () => {
        expect(mockSocketServer.on).toHaveBeenCalledWith(
            "connection",
            expect.any(Function)
        );
    });

    it("should log client connection and disconnection", () => {
        const mockSocket = {
            id: "123",
            on: jest.fn(),
        } as unknown as jest.Mocked<SocketIOClient>;

        const connectionHandler = mockSocketServer.on.mock.calls[0][1];
        connectionHandler(mockSocket);

        expect(logger.info).toHaveBeenCalledWith(
            `Client connected: ${mockSocket.id}`
        );

        // @ts-ignore
        const disconnectHandler = mockSocket.on.mock.calls.find(
            (call) => call[0] === "disconnect"
        )[1];
        disconnectHandler("test reason");

        expect(logger.info).toHaveBeenCalledWith(
            `Client disconnected: ${mockSocket.id}, reason: test reason`
        );
    });

    it("should log socket errors", () => {
        const mockSocket = {
            id: "123",
            on: jest.fn(),
        } as unknown as jest.Mocked<SocketIOClient>;

        const connectionHandler = mockSocketServer.on.mock.calls[0][1];
        connectionHandler(mockSocket);

        // @ts-ignore
        const errorHandler = mockSocket.on.mock.calls.find(
            (call) => call[0] === "error"
        )[1];
        errorHandler("test error");

        expect(logger.error).toHaveBeenCalledWith(
            `Error from ${mockSocket.id}: test error`
        );
    });

    it("should broadcast an event to all connected clients", () => {
        const event = "testEvent";
        const args = ["arg1", "arg2"];

        socketInstance.broadcast(event, ...args);

        expect(mockSocketServer.emit).toHaveBeenCalledWith(event, ...args);
    });

    it("should send an event to a specific client", () => {
        const clientId = "123";
        const event = "testEvent";
        const args = ["arg1", "arg2"];
        const mockSocket = {
            emit: jest.fn(),
        } as unknown as jest.Mocked<SocketIOClient>;

        // @ts-ignore
        mockSocketServer.sockets = {
            sockets: new Map([[clientId, mockSocket]]),
        } as any;

        socketInstance.sendToClient(clientId, event, ...args);

        expect(mockSocket.emit).toHaveBeenCalledWith(event, ...args);
    });

    it("should handle the case where the client is not found", () => {
        const clientId = "unknown";
        const event = "testEvent";
        const args = ["arg1", "arg2"];

        socketInstance.sendToClient(clientId, event, ...args);

        expect(logger.error).toHaveBeenCalledWith(
            `Client with id ${clientId} not found`
        );
    });
});
