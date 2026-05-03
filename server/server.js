import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./lib/db.js";
import errorHandler from "./middleware/errorHandler.js";
import { initSocket } from "./lib/socket.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const REQUIRED = ["MONGODB_URI", "JWT_SECRET"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    process.exit(1);
}

await connectDB();

const app = express();

app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    })
);

app.get("/api/health", (req, res) => {
    res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects/:projectId/ai", aiRoutes);
app.use("/api/inbox", inboxRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: { message: "Not found" } });
});

app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 7070;
httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
