import Project from "../models/Project.model.js";
import User from "../models/User.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { isOwner, canView, canEdit } from "../lib/authz.js";
import { emitToProject } from "../lib/socket.js";
import { sendProjectInvite } from "../lib/email.js";

const MEMBER_FIELDS = "firstName lastName username email avatar";

const PROJECT_POPULATE = [
    { path: "owner", select: MEMBER_FIELDS },
    { path: "members.user", select: MEMBER_FIELDS },
];

const populateProject = (query) => query.populate(PROJECT_POPULATE);

export const listProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const projects = await populateProject(
        Project.find({
            $or: [{ owner: userId }, { "members.user": userId }],
        }).sort("-updatedAt")
    );
    res.json({ success: true, data: { projects } });
});

export const getProject = asyncHandler(async (req, res) => {
    const project = await populateProject(Project.findById(req.params.projectId));
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canView(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }
    res.json({ success: true, data: { project } });
});

export const createProject = asyncHandler(async (req, res) => {
    const created = await Project.create({
        title: req.body.title,
        description: req.body.description,
        visibility: req.body.visibility,
        owner: req.user.id,
    });
    await created.populate(PROJECT_POPULATE);
    res.status(201).json({ success: true, data: { project: created } });
});

export const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canEdit(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }
    Object.assign(project, req.body);
    await project.save();
    await project.populate(PROJECT_POPULATE);
    emitToProject(project._id.toString(), "project:updated", { project });
    res.json({ success: true, data: { project } });
});

export const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!isOwner(project, req.user.id)) {
        return res
            .status(403)
            .json({ success: false, error: { message: "Only the owner can delete this project" } });
    }
    const projectId = project._id.toString();
    await project.deleteOne();
    emitToProject(projectId, "project:deleted", { id: projectId });
    res.json({ success: true, data: { id: projectId } });
});

export const addMember = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!isOwner(project, req.user.id)) {
        return res
            .status(403)
            .json({ success: false, error: { message: "Only the owner can add members" } });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ success: false, error: { message: "User not found" } });
    }
    if (user._id.toString() === project.owner.toString()) {
        return res
            .status(400)
            .json({ success: false, error: { message: "User is already the owner" } });
    }
    if (project.members.some((m) => m.user.toString() === user._id.toString())) {
        return res
            .status(409)
            .json({ success: false, error: { message: "User is already a member" } });
    }

    project.members.push({ user: user._id, role: req.body.role });
    await project.save();
    await project.populate(PROJECT_POPULATE);

    emitToProject(project._id.toString(), "member:added", { project });

    const inviter = project.owner;
    const inviterName =
        inviter?.firstName
            ? `${inviter.firstName} ${inviter.lastName || ""}`.trim()
            : inviter?.username || "A teammate";
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    sendProjectInvite({
        to: user.email,
        inviterName,
        projectTitle: project.title,
        link: `${clientUrl}/dashboard/projects/${project._id}`,
    }).catch((err) => console.error("[email] invite failed:", err.message));

    res.status(201).json({ success: true, data: { project } });
});

export const removeMember = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!isOwner(project, req.user.id)) {
        return res
            .status(403)
            .json({ success: false, error: { message: "Only the owner can remove members" } });
    }

    const before = project.members.length;
    project.members = project.members.filter(
        (m) => m.user.toString() !== req.params.memberId
    );
    if (project.members.length === before) {
        return res.status(404).json({ success: false, error: { message: "Member not found" } });
    }
    await project.save();
    await project.populate(PROJECT_POPULATE);

    emitToProject(project._id.toString(), "member:removed", { project });
    res.json({ success: true, data: { project } });
});
