import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        avatar: { type: String, default: null },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        preferences: {
            aiSuggestion: { type: Boolean, default: true },
            notifications: { type: Boolean, default: true },
        },
        lastActive: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

userSchema.methods.toClient = function () {
    const { _id, username, firstName, lastName, email, avatar, role, preferences } = this;
    return { id: _id, username, firstName, lastName, email, avatar, role, preferences };
};

const User = mongoose.model("User", userSchema);

export default User;
