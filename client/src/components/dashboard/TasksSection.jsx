import { useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Calendar, User as UserIcon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import TaskDialog from "./TaskDialog";
import AIGenerateTasksDialog from "./AIGenerateTasksDialog";

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

const initialsOf = (person) => {
    if (!person) return "?";
    const f = person.firstName?.[0] || "";
    const l = person.lastName?.[0] || "";
    if (f || l) return `${f}${l}`.toUpperCase();
    return (person.username || person.email || "?").slice(0, 2).toUpperCase();
};

const TaskCard = ({ task, canEdit, onEdit, onDelete, onStatusChange, updatePending }) => {
    const due = formatDueDate(task.dueDate);

    return (
        <div className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight">{task.title}</p>
                {canEdit && (
                    <div className="flex shrink-0 gap-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onEdit(task)}
                            aria-label="Edit task"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDelete(task)}
                            aria-label="Delete task"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>

            {task.description && (
                <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant={PRIORITY_VARIANT[task.priority] || "secondary"}>
                    {task.priority}
                </Badge>
                {task.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                    </Badge>
                ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    {task.assignedTo ? (
                        <>
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                    {initialsOf(task.assignedTo)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                                {task.assignedTo.firstName || task.assignedTo.username || task.assignedTo.email}
                            </span>
                        </>
                    ) : (
                        <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            Unassigned
                        </span>
                    )}
                </div>
                {due && (
                    <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {due}
                    </span>
                )}
            </div>

            {canEdit && (
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task, e.target.value)}
                    disabled={updatePending}
                    className="flex h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="Todo">To do</option>
                    <option value="Inprogress">In progress</option>
                    <option value="Completed">Completed</option>
                </select>
            )}
        </div>
    );
};

const TasksSection = ({ project, canEdit }) => {
    const projectId = project._id || project.id;
    const { data: tasks = [], isLoading, isError, error } = useTasks(projectId);
    const updateMutation = useUpdateTask(projectId);
    const deleteMutation = useDeleteTask(projectId);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const openNew = () => {
        setEditingTask(null);
        setDialogOpen(true);
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    const handleStatusChange = (task, status) => {
        updateMutation.mutate({ taskId: task._id || task.id, values: { status } });
    };

    const handleDelete = (task) => {
        if (!window.confirm(`Delete task "${task.title}"?`)) return;
        deleteMutation.mutate(task._id || task.id);
    };

    const grouped = STATUS_COLUMNS.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.status === col.id),
    }));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Tasks</CardTitle>
                {canEdit && (
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setAiDialogOpen(true)}>
                            <Sparkles className="h-4 w-4" />
                            Generate with AI
                        </Button>
                        <Button size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            New task
                        </Button>
                    </div>
                )}
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
                        No tasks yet. {canEdit ? "Click \"New task\" to add one." : ""}
                    </p>
                )}

                {!isLoading && tasks.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {grouped.map((col) => (
                            <div key={col.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {col.label}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {col.tasks.length}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {col.tasks.map((task) => (
                                        <TaskCard
                                            key={task._id || task.id}
                                            task={task}
                                            canEdit={canEdit}
                                            onEdit={openEdit}
                                            onDelete={handleDelete}
                                            onStatusChange={handleStatusChange}
                                            updatePending={updateMutation.isPending}
                                        />
                                    ))}
                                    {col.tasks.length === 0 && (
                                        <p className="rounded-md border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                                            Empty
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {deleteMutation.isError && (
                    <p className="mt-3 text-sm text-destructive">{deleteMutation.error.message}</p>
                )}
            </CardContent>

            <TaskDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                projectId={projectId}
                project={project}
                task={editingTask}
            />

            <AIGenerateTasksDialog
                open={aiDialogOpen}
                onOpenChange={setAiDialogOpen}
                projectId={projectId}
            />
        </Card>
    );
};

export default TasksSection;
