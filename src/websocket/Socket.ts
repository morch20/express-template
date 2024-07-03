import { Server } from "socket.io";
import http from "http";
import { logger } from "@/lib/logger";

/**
 * Socket class to manage Socket.IO server operations.
 */
export default class Socket {
    private io: Server;

    /**
     * Creates an instance of Socket.
     * @param {http.Server} server - The HTTP server instance to attach Socket.IO to.
     */
    constructor(server: http.Server) {
        this.io = new Server(server);
        this.initializeSocketListeners();
    }

    /**
     * Initializes default socket event listeners for handling connections, disconnections, and errors.
     * @private
     */
    private initializeSocketListeners(): void {
        this.io.on("connection", (socket) => {
            logger.info(`Client connected: ${socket.id}`);

            socket.on("disconnect", (reason: string) => {
                logger.info(
                    `Client disconnected: ${socket.id}, reason: ${reason}`
                );
            });

            socket.on("error", (error: any) => {
                logger.error(`Error from ${socket.id}: ${error}`);
            });
        });
    }

    /**
     * Broadcasts an event to all connected clients.
     * @param {string} event - The event name to broadcast.
     * @param {...any[]} args - The arguments to broadcast with the event.
     */
    public broadcast(event: string, ...args: any[]): void {
        this.io.emit(event, ...args);
    }

    /**
     * Sends an event to a specific client.
     * @param {string} clientId - The ID of the client to send the event to.
     * @param {string} event - The event name to send.
     * @param {...any[]} args - The arguments to send with the event.
     */
    public sendToClient(clientId: string, event: string, ...args: any[]): void {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
            socket.emit(event, ...args);
        } else {
            // TODO: handle this case more properly
            logger.error(`Client with id ${clientId} not found`);
        }
    }
}
