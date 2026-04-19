import { Resend } from "resend";

let resendClient = null;

const getClient = () => {
    if (!process.env.RESEND_API_KEY) return null;
    if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
};

const from = () => process.env.RESEND_FROM || "onboarding@resend.dev";

export const sendEmail = async ({ to, subject, html }) => {
    const client = getClient();
    if (!client) {
        console.warn("[email] RESEND_API_KEY missing — skipping send");
        return { skipped: true };
    }
    return client.emails.send({ from: from(), to, subject, html });
};

export const sendWelcome = (user) =>
    sendEmail({
        to: user.email,
        subject: "Welcome to Flow AI",
        html: `<h1>Welcome, ${user.firstName}!</h1><p>You're all set up on Flow AI. Start by creating your first project.</p>`,
    });

export const sendProjectInvite = ({ to, inviterName, projectTitle, link }) =>
    sendEmail({
        to,
        subject: `${inviterName} invited you to "${projectTitle}" on Flow AI`,
        html: `<p>${inviterName} has invited you to collaborate on <strong>${projectTitle}</strong>.</p><p><a href="${link}">Open the project</a></p>`,
    });

export const sendTaskAssignment = ({ to, taskTitle, projectTitle, link }) =>
    sendEmail({
        to,
        subject: `You were assigned: ${taskTitle}`,
        html: `<p>You've been assigned <strong>${taskTitle}</strong> in <em>${projectTitle}</em>.</p><p><a href="${link}">View task</a></p>`,
    });
