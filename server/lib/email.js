import { Resend } from "resend";

let resendClient = null;

const getClient = () => {
    if (!process.env.RESEND_API_KEY) return null;
    if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
};

const from = () => process.env.RESEND_FROM || "onboarding@resend.dev";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[c]));

export const sendEmail = async ({ to, subject, html }) => {
    const client = getClient();
    if (!client) {
        console.warn("[email] RESEND_API_KEY missing — skipping send");
        return { skipped: true };
    }
    try {
        const result = await client.emails.send({ from: from(), to, subject, html });
        if (result?.error) {
            console.error("[email] resend error:", result.error);
        }
        return result;
    } catch (err) {
        console.error("[email] send failed:", err.message);
        return { error: err.message };
    }
};

export const sendWelcome = (user) =>
    sendEmail({
        to: user.email,
        subject: "Welcome to Flow AI",
        html: `<h1>Welcome, ${escapeHtml(user.firstName)}!</h1><p>You're all set up on Flow AI. Start by creating your first project.</p>`,
    });

export const sendProjectInvite = ({ to, inviterName, projectTitle, link }) =>
    sendEmail({
        to,
        subject: `${inviterName} invited you to "${projectTitle}" on Flow AI`,
        html: `<p>${escapeHtml(inviterName)} has invited you to collaborate on <strong>${escapeHtml(projectTitle)}</strong>.</p><p><a href="${escapeHtml(link)}">Open the project</a></p>`,
    });

export const sendTaskAssignment = ({ to, taskTitle, projectTitle, link }) =>
    sendEmail({
        to,
        subject: `You were assigned: ${taskTitle}`,
        html: `<p>You've been assigned <strong>${escapeHtml(taskTitle)}</strong> in <em>${escapeHtml(projectTitle)}</em>.</p><p><a href="${escapeHtml(link)}">View task</a></p>`,
    });
