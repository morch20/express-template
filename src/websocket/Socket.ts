import { Server, ServerOptions, Socket as WebSocket } from "socket.io";
import http from "http";
import { logger } from "@/lib/logger";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

/**
 * Socket class to manage Socket.IO server operations.
 */
export default class Socket {
    private io: Server;

    /**
     * Creates an instance of Socket.
     * @param {http.Server} server - The HTTP server instance to attach Socket.IO to.
     * @param {Partial<ServerOptions>} opts - The Socket.io configuration options.
     */
    constructor(server: http.Server, opts: Partial<ServerOptions> = {}) {
        this.io = new Server(server, opts);
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
     * Adds middleware to the Socket.IO server. Middleware functions are executed
     * before the connection is completed. They can be used for tasks such as authentication.
     * @param {Function} callBack - The middleware function to execute.
     */
    public middleware(
        callBack: (
            socket: WebSocket<
                DefaultEventsMap,
                DefaultEventsMap,
                DefaultEventsMap,
                any
            >,
            next: (err?: ExtendedError | undefined) => void
        ) => void
    ): void {
        this.io.use((socket, next) => {
            callBack(socket, next);
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
