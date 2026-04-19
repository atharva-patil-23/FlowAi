import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, default: "", trim: true, maxlength: 1000 },
        completed: { type: Boolean, default: false },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
                role: { type: String, enum: ["editor", "viewer"], default: "editor" },
            },
        ],
        visibility: {
            type: String,
            enum: ["public", "private"],
            default: "private",
        },
    },
    { timestamps: true }
);

projectSchema.index({ "members.user": 1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
