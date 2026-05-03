import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Project from "../models/Project.model.js";
import { canView } from "./authz.js";

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Missing auth token"));
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = { id: payload.id, email: payload.email };
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        socket.on("join:project", async (projectId, ack) => {
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return ack?.({ ok: false, error: "Invalid project" });
            }
            try {
                const project = await Project.findById(projectId).select("owner members");
                if (!project) return ack?.({ ok: false, error: "Project not found" });
                if (!canView(project, socket.user.id)) {
                    return ack?.({ ok: false, error: "Forbidden" });
                }
                socket.join(`project:${projectId}`);
                ack?.({ ok: true });
            } catch (err) {
                console.error("[socket.join:project]", err);
                ack?.({ ok: false, error: "Could not join project" });
            }
        });

        socket.on("leave:project", (projectId) => {
            if (typeof projectId !== "string") return;
            socket.leave(`project:${projectId}`);
        });
    });

    return io;
};

export const emitToProject = (projectId, event, payload) => {
    if (!io) return;
    io.to(`project:${projectId}`).emit(event, payload);
};

export const getIO = () => io;
