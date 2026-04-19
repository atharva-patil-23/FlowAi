import { NavLink } from "react-router-dom";
import { Plus, Inbox, Folder } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PLACEHOLDER_PROJECTS = [];

const Sidebar = ({ collapsed = false, onNewProject }) => {
    const user = useAuthStore((s) => s.user);
    const initials =
        (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <aside
            className={cn(
                "flex h-full flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-200",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex h-14 items-center gap-2 px-4">
                <img src="/flowai-logo.png" alt="Flow AI" className="h-7 w-7 rounded" />
                {!collapsed && <span className="font-semibold tracking-tight">Flow AI</span>}
            </div>

            <Separator />

            <nav className="flex-1 overflow-y-auto p-2">
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )
                    }
                >
                    <Inbox className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Inbox</span>}
                </NavLink>

                <div className="mt-4 flex items-center justify-between px-3 py-1">
                    {!collapsed && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Projects
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onNewProject}
                        aria-label="New project"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {PLACEHOLDER_PROJECTS.length === 0 && !collapsed && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                        No projects yet. Click + to create one.
                    </p>
                )}

                {PLACEHOLDER_PROJECTS.map((project) => (
                    <NavLink
                        key={project.id}
                        to={`/dashboard/projects/${project.id}`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )
                        }
                    >
                        <Folder className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{project.name}</span>}
                    </NavLink>
                ))}
            </nav>

            <Separator />

            <div className="flex items-center gap-3 p-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
