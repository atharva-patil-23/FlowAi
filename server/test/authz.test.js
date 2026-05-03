import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { isOwner, canView, canEdit, memberEntry } from "../lib/authz.js";

const oid = () => new mongoose.Types.ObjectId();

describe("authz", () => {
    const ownerId = oid();
    const editorId = oid();
    const viewerId = oid();
    const strangerId = oid();

    const project = {
        owner: ownerId,
        members: [
            { user: editorId, role: "editor" },
            { user: viewerId, role: "viewer" },
        ],
    };

    it("isOwner: true for owner, false for everyone else", () => {
        expect(isOwner(project, ownerId)).toBe(true);
        expect(isOwner(project, editorId)).toBe(false);
        expect(isOwner(project, strangerId)).toBe(false);
    });

    it("canView: owner + members", () => {
        expect(canView(project, ownerId)).toBe(true);
        expect(canView(project, editorId)).toBe(true);
        expect(canView(project, viewerId)).toBe(true);
        expect(canView(project, strangerId)).toBe(false);
    });

    it("canEdit: owner + editor only (not viewer)", () => {
        expect(canEdit(project, ownerId)).toBe(true);
        expect(canEdit(project, editorId)).toBe(true);
        expect(canEdit(project, viewerId)).toBe(false);
        expect(canEdit(project, strangerId)).toBe(false);
    });

    it("handles populated owner doc", () => {
        const populated = { ...project, owner: { _id: ownerId } };
        expect(isOwner(populated, ownerId)).toBe(true);
    });

    it("handles string owner id", () => {
        const stringy = { ...project, owner: ownerId.toString() };
        expect(isOwner(stringy, ownerId.toString())).toBe(true);
    });

    it("memberEntry returns the matching entry", () => {
        expect(memberEntry(project, editorId)?.role).toBe("editor");
        expect(memberEntry(project, viewerId)?.role).toBe("viewer");
        expect(memberEntry(project, strangerId)).toBeUndefined();
    });

    it("null/undefined userId is denied", () => {
        expect(canView(project, null)).toBe(false);
        expect(canEdit(project, undefined)).toBe(false);
    });

    it("empty members array", () => {
        const p = { owner: ownerId, members: [] };
        expect(canView(p, editorId)).toBe(false);
        expect(canView(p, ownerId)).toBe(true);
    });
});
