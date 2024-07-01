import { Server } from "socket.io";
import http from "http";
import { logger } from "@/lib/logger";

export default class Socket {
    private io: Server;

    constructor(server: http.Server) {
        this.io = new Server(server);
        this.initializeSocketListeners();
    }

    private initializeSocketListeners(): void {
        this.io.on("connection", (socket) => {
            logger.info(`Client connected: ${socket.id}`);

            socket.on("disconnect", (reason: string) => {
                logger.info(
                    `Client disconnected: ${socket.id}, reason: ${reason}`
                );
            });

            socket.on("customEvent", (data: any) => {
                logger.info(`Received customEvent from ${socket.id}:`, data);
                // Broadcast the event to all connected clients
                this.io.emit("customEvent", data);
            });

            socket.on("error", (error: any) => {
                logger.error(`Error from ${socket.id}: ${error}`);
            });
        });
    }

    public broadcast(event: string, ...args: any[]): void {
        this.io.emit(event, ...args);
    }

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
