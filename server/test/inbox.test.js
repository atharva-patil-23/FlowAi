import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/task.model.js";
import inboxRoutes from "../routes/inboxRoutes.js";
import errorHandler from "../middleware/errorHandler.js";

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use("/api/inbox", inboxRoutes);
    app.use(errorHandler);
    return app;
};

const tokenFor = (user) =>
    jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET);

const seedUser = (email) =>
    User.create({
        username: email.split("@")[0],
        firstName: "F",
        lastName: "L",
        email,
        password: "secret123",
    });

describe("GET /api/inbox/tasks", () => {
    let app, alice, bob, project;

    beforeEach(async () => {
        app = buildApp();
        alice = await seedUser("alice@x.com");
        bob = await seedUser("bob@x.com");
        project = await Project.create({
            title: "Shared",
            owner: alice._id,
            members: [{ user: bob._id, role: "editor" }],
        });
    });

    it("only returns tasks assigned to the caller", async () => {
        await Task.create({
            title: "alice task",
            projectId: project._id,
            createdBy: alice._id,
            assignedTo: alice._id,
        });
        await Task.create({
            title: "bob task",
            projectId: project._id,
            createdBy: alice._id,
            assignedTo: bob._id,
        });

        const res = await request(app)
            .get("/api/inbox/tasks")
            .set("Authorization", `Bearer ${tokenFor(alice)}`);

        expect(res.status).toBe(200);
        expect(res.body.data.tasks).toHaveLength(1);
        expect(res.body.data.tasks[0].title).toBe("alice task");
    });

    it("filters out tasks from projects the user is no longer a member of", async () => {
        await Task.create({
            title: "stale assignment",
            projectId: project._id,
            createdBy: alice._id,
            assignedTo: bob._id,
        });

        // Bob is removed from the project
        project.members = [];
        await project.save();

        const res = await request(app)
            .get("/api/inbox/tasks")
            .set("Authorization", `Bearer ${tokenFor(bob)}`);

        expect(res.status).toBe(200);
        expect(res.body.data.tasks).toEqual([]);
    });

    it("rejects unauthenticated requests", async () => {
        const res = await request(app).get("/api/inbox/tasks");
        expect(res.status).toBe(401);
    });
});
