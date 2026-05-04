import { Link } from "react-router-dom";
import { Loader2, Inbox as InboxIcon, Calendar, Folder } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useInboxTasks, useUpdateInboxTaskStatus } from "@/hooks/useInbox";

const STATUS_COLUMNS = [
    { id: "Todo", label: "To do" },
    { id: "Inprogress", label: "In progress" },
    { id: "Completed", label: "Completed" },
];

const PRIORITY_PILL = {
    High: "bg-red-500/25 text-red-200 border-red-400/40",
    Medium: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    Low: "bg-white/10 text-white/70 border-white/15",
};

const formatDueDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const isOverdue = (iso, status) => {
    if (!iso || status === "Completed") return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    return d < new Date(new Date().toDateString());
};

const InboxTaskRow = ({ task, onStatusChange, updatePending }) => {
    const due = formatDueDate(task.dueDate);
    const overdue = isOverdue(task.dueDate, task.status);
    const projectId = task.projectId?._id || task.projectId?.id || task.projectId;
    const pillClass = PRIORITY_PILL[task.priority] || PRIORITY_PILL.Medium;

    return (
        <div className="glass-row rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-medium">{task.title}</p>
                <Link
                    to={`/dashboard/projects/${projectId}`}
                    className="mt-0.5 flex items-center gap-1 text-xs text-white/60 hover:text-white"
                >
                    <Folder className="h-3 w-3" />
                    {task.projectId?.title || "Project"}
                </Link>
            </div>

            <span
                className={`text-[11.5px] px-2.5 py-0.5 rounded-full border ${pillClass}`}
            >
                {task.priority}
            </span>

            {due && (
                <span
                    className={`flex items-center gap-1 text-xs ${
                        overdue ? "text-red-300" : "text-white/65"
                    }`}
                >
                    <Calendar className="h-3 w-3" />
                    {due}
                </span>
            )}

            <select
                value={task.status}
                onChange={(e) =>
                    onStatusChange({
                        projectId,
                        taskId: task._id || task.id,
                        status: e.target.value,
                    })
                }
                disabled={updatePending}
                className="glass-row h-8 rounded-lg px-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
                <option value="Todo">To do</option>
                <option value="Inprogress">In progress</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
    );
};

const DashboardHome = () => {
    const user = useAuthStore((s) => s.user);
    const firstName = user?.firstName || user?.username || "there";

    const { data: tasks = [], isLoading, isError, error } = useInboxTasks();
    const updateMutation = useUpdateInboxTaskStatus();

    const grouped = STATUS_COLUMNS.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.status === col.id),
    }));

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="px-1">
                <div className="text-[12.5px] text-white/65 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Live · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow">
                    Welcome back, {firstName}.
                </h1>
                <p className="mt-1 text-[15px] text-white/75">
                    {tasks.length === 0
                        ? "Nothing assigned to you yet. Enjoy the quiet."
                        : `${tasks.length} task${tasks.length === 1 ? "" : "s"} across your projects.`}
                </p>
            </div>

            <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-1">
                    <InboxIcon className="h-5 w-5 text-red-300" />
                    <h2 className="text-[18px] font-semibold">Inbox</h2>
                    <span className="text-[13px] text-white/55">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                    </span>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-10 text-white/55">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}

                {isError && (
                    <p className="py-6 text-sm text-red-300">{error.message}</p>
                )}

                {!isLoading && !isError && tasks.length === 0 && (
                    <p className="py-10 text-center text-sm text-white/55">
                        Nothing assigned to you yet. Enjoy the quiet.
                    </p>
                )}

                {!isLoading && tasks.length > 0 && (
                    <div className="space-y-6 mt-4">
                        {grouped.map((col) => {
                            if (col.tasks.length === 0) return null;
                            return (
                                <div key={col.id} className="space-y-2">
                                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
                                        {col.label} ({col.tasks.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {col.tasks.map((task) => (
                                            <InboxTaskRow
                                                key={task._id || task.id}
                                                task={task}
                                                onStatusChange={(vars) =>
                                                    updateMutation.mutate(vars)
                                                }
                                                updatePending={updateMutation.isPending}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {updateMutation.isError && (
                    <p className="mt-3 text-sm text-red-300">
                        {updateMutation.error.message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
