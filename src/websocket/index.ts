import { createServer } from "node:http";
import app from "@/app";
import Socket from "./Socket";

// You would have to import server from here in src/index.ts
export const server = createServer(app);

const socket = new Socket(server);

export default socket;
