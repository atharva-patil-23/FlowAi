import Task from "../models/task.model.js";
import Project from "../models/Project.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { canView, canEdit } from "../lib/authz.js";
import { emitToProject } from "../lib/socket.js";

const USER_FIELDS = "firstName lastName username email avatar";

const TASK_POPULATE = [
    { path: "createdBy", select: USER_FIELDS },
    { path: "assignedTo", select: USER_FIELDS },
];

const loadProjectForAccess = async (projectId) => Project.findById(projectId);

const assigneeIsMember = (project, userId) => {
    if (!userId) return true;
    if (project.owner.toString() === userId.toString()) return true;
    return project.members.some((m) => m.user.toString() === userId.toString());
};

const isAssignee = (task, userId) =>
    task.assignedTo && task.assignedTo.toString() === userId.toString();

export const listAssignedTasks = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const tasks = await Task.find({ assignedTo: userId })
        .sort("-updatedAt")
        .populate("createdBy", USER_FIELDS)
        .populate("assignedTo", USER_FIELDS)
        .populate({
            path: "projectId",
            select: "title visibility",
            match: {
                $or: [{ owner: userId }, { "members.user": userId }],
            },
        });
    const visible = tasks.filter((t) => t.projectId);
    res.json({ success: true, data: { tasks: visible } });
});

export const listTasks = asyncHandler(async (req, res) => {
    const project = await loadProjectForAccess(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canView(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    const filter = { projectId: project._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

    const tasks = await Task.find(filter).sort("-createdAt").populate(TASK_POPULATE);
    res.json({ success: true, data: { tasks } });
});

export const createTask = asyncHandler(async (req, res) => {
    const project = await loadProjectForAccess(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canEdit(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }
    if (req.body.assignedTo && !assigneeIsMember(project, req.body.assignedTo)) {
        return res
            .status(400)
            .json({ success: false, error: { message: "Assignee must be a project member" } });
    }

    const created = await Task.create({
        ...req.body,
        projectId: project._id,
        createdBy: req.user.id,
    });
    await created.populate(TASK_POPULATE);
    emitToProject(project._id.toString(), "task:created", { task: created });
    res.status(201).json({ success: true, data: { task: created } });
});

export const updateTask = asyncHandler(async (req, res) => {
    const project = await loadProjectForAccess(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }

    const task = await Task.findOne({ _id: req.params.taskId, projectId: project._id });
    if (!task) {
        return res.status(404).json({ success: false, error: { message: "Task not found" } });
    }

    const bodyKeys = Object.keys(req.body);
    const isStatusOnlyByAssignee =
        bodyKeys.length === 1 &&
        bodyKeys[0] === "status" &&
        isAssignee(task, req.user.id) &&
        canView(project, req.user.id);

    if (!isStatusOnlyByAssignee && !canEdit(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    if (
        "assignedTo" in req.body &&
        req.body.assignedTo &&
        !assigneeIsMember(project, req.body.assignedTo)
    ) {
        return res
            .status(400)
            .json({ success: false, error: { message: "Assignee must be a project member" } });
    }

    Object.assign(task, req.body);
    await task.save();
    await task.populate(TASK_POPULATE);
    emitToProject(project._id.toString(), "task:updated", { task });
    res.json({ success: true, data: { task } });
});

export const deleteTask = asyncHandler(async (req, res) => {
    const project = await loadProjectForAccess(req.params.projectId);
    if (!project) {
        return res.status(404).json({ success: false, error: { message: "Project not found" } });
    }
    if (!canEdit(project, req.user.id)) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    const task = await Task.findOneAndDelete({
        _id: req.params.taskId,
        projectId: project._id,
    });
    if (!task) {
        return res.status(404).json({ success: false, error: { message: "Task not found" } });
    }
    emitToProject(project._id.toString(), "task:deleted", { id: task._id.toString() });
    res.json({ success: true, data: { id: task._id } });
});
