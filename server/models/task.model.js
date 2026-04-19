import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, default: "", trim: true, maxlength: 2000 },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium",
        },
        status: {
            type: String,
            enum: ["Todo", "Inprogress", "Completed"],
            default: "Todo",
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        dueDate: { type: Date, default: null },
        tags: [{ type: String, trim: true }],
    },
    { timestamps: true }
);

taskSchema.index({ projectId: 1, status: 1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
