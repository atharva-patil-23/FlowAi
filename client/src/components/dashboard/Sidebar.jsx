import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Inbox, Folder, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useProjects } from "@/hooks/useProjects";
import NewProjectDialog from "./NewProjectDialog";

const Sidebar = ({ collapsed = false }) => {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: projects = [], isLoading, isError } = useProjects();

    const initials =
        (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") ||
        user?.email?.[0]?.toUpperCase() ||
        "U";

    const linkClass = ({ isActive }) =>
        cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
            isActive
                ? "glass-strong text-white shadow-lg shadow-red-500/10"
                : "text-white/70 hover:text-white hover:bg-white/5"
        );

    return (
        <aside
            className={cn(
                "glass rounded-3xl flex h-full flex-col p-3 transition-[width] duration-200",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex h-12 items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
                    ✦
                </div>
                {!collapsed && (
                    <span className="font-semibold tracking-tight text-shadow">Flow AI</span>
                )}
            </div>

            <div className="my-3 h-px bg-white/10" />

            <nav className="flex-1 overflow-y-auto space-y-1">
                <NavLink to="/dashboard" end className={linkClass}>
                    <Inbox className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Inbox</span>}
                </NavLink>

                <div className="mt-5 flex items-center justify-between px-3 py-1">
                    {!collapsed && (
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                            Projects
                        </span>
                    )}
                    <button
                        onClick={() => setDialogOpen(true)}
                        aria-label="New project"
                        className="h-6 w-6 rounded-md flex items-center justify-center text-white/65 hover:text-white hover:bg-white/10"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {isLoading && !collapsed && (
                    <p className="flex items-center gap-2 px-3 py-2 text-xs text-white/55">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                    </p>
                )}

                {isError && !collapsed && (
                    <p className="px-3 py-2 text-xs text-red-300">Failed to load projects</p>
                )}

                {!isLoading && projects.length === 0 && !collapsed && (
                    <p className="px-3 py-2 text-xs text-white/55">
                        No projects yet. Click + to create one.
                    </p>
                )}

                {projects.map((project) => (
                    <NavLink
                        key={project._id || project.id}
                        to={`/dashboard/projects/${project._id || project.id}`}
                        className={linkClass}
                    >
                        <Folder className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{project.title}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="my-3 h-px bg-white/10" />

            <div className="glass-row rounded-2xl flex items-center gap-2.5 p-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white text-[12px] font-medium shadow-md shadow-red-500/30">
                    {initials.slice(0, 2).toUpperCase()}
                </div>
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">
                            {user?.firstName
                                ? `${user.firstName} ${user.lastName || ""}`.trim()
                                : user?.username}
                        </p>
                        <p className="truncate text-[11px] text-white/55">{user?.email}</p>
                    </div>
                )}
            </div>

            <NewProjectDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onCreated={(project) =>
                    navigate(`/dashboard/projects/${project._id || project.id}`)
                }
            />
        </aside>
    );
};

export default Sidebar;
