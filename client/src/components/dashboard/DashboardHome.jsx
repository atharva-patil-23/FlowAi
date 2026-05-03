import { Link } from "react-router-dom";
import { Loader2, Inbox as InboxIcon, Calendar, Folder } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useInboxTasks, useUpdateInboxTaskStatus } from "@/hooks/useInbox";

const STATUS_COLUMNS = [
    { id: "Todo", label: "To do" },
    { id: "Inprogress", label: "In progress" },
    { id: "Completed", label: "Completed" },
];

const PRIORITY_VARIANT = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
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

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <Link
                    to={`/dashboard/projects/${projectId}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                    <Folder className="h-3 w-3" />
                    {task.projectId?.title || "Project"}
                </Link>
            </div>

            <Badge variant={PRIORITY_VARIANT[task.priority] || "secondary"}>
                {task.priority}
            </Badge>

            {due && (
                <span
                    className={`flex items-center gap-1 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}
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
                className="flex h-8 rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Welcome back, {firstName}
                </h1>
                <p className="text-muted-foreground">
                    Tasks assigned to you across all your projects.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <InboxIcon className="h-5 w-5" />
                        Inbox
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    )}

                    {isError && (
                        <p className="text-sm text-destructive">{error.message}</p>
                    )}

                    {!isLoading && !isError && tasks.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nothing assigned to you yet. Enjoy the quiet.
                        </p>
                    )}

                    {!isLoading && tasks.length > 0 && (
                        <div className="space-y-6">
                            {grouped.map((col) => {
                                if (col.tasks.length === 0) return null;
                                return (
                                    <div key={col.id} className="space-y-2">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
                        <p className="mt-3 text-sm text-destructive">
                            {updateMutation.error.message}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardHome;
