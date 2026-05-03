import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import Task from "../models/task.model.js";
import taskRoutes from "../routes/taskRoutes.js";
import errorHandler from "../middleware/errorHandler.js";

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use("/api/projects/:projectId/tasks", taskRoutes);
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

describe("PATCH /projects/:projectId/tasks/:taskId", () => {
    let app, owner, viewer, stranger, project, task;

    beforeEach(async () => {
        app = buildApp();
        owner = await seedUser("owner@x.com");
        viewer = await seedUser("viewer@x.com");
        stranger = await seedUser("stranger@x.com");
        project = await Project.create({
            title: "P",
            owner: owner._id,
            members: [{ user: viewer._id, role: "viewer" }],
        });
        task = await Task.create({
            title: "Test",
            status: "Todo",
            projectId: project._id,
            createdBy: owner._id,
            assignedTo: viewer._id,
        });
    });

    it("viewer-assignee can change status only on their own task", async () => {
        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(viewer)}`)
            .send({ status: "Inprogress" });

        expect(res.status).toBe(200);
        expect(res.body.data.task.status).toBe("Inprogress");
    });

    it("viewer-assignee CANNOT change non-status fields", async () => {
        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(viewer)}`)
            .send({ title: "Hijacked" });

        expect(res.status).toBe(403);
    });

    it("viewer-assignee CANNOT change status + extra field in same request", async () => {
        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(viewer)}`)
            .send({ status: "Inprogress", title: "Hijacked" });

        expect(res.status).toBe(403);
    });

    it("non-member CANNOT change anything", async () => {
        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(stranger)}`)
            .send({ status: "Inprogress" });

        expect(res.status).toBe(403);
    });

    it("owner can change any field", async () => {
        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(owner)}`)
            .send({ title: "Renamed", priority: "High" });

        expect(res.status).toBe(200);
        expect(res.body.data.task.title).toBe("Renamed");
        expect(res.body.data.task.priority).toBe("High");
    });

    it("viewer who is NOT the assignee cannot change status", async () => {
        const otherViewer = await seedUser("other@x.com");
        project.members.push({ user: otherViewer._id, role: "viewer" });
        await project.save();

        const res = await request(app)
            .patch(`/api/projects/${project._id}/tasks/${task._id}`)
            .set("Authorization", `Bearer ${tokenFor(otherViewer)}`)
            .send({ status: "Inprogress" });

        expect(res.status).toBe(403);
    });
});
