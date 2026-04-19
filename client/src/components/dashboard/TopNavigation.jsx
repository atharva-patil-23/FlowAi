import { Search, Bell, Plus, Menu, User, Settings, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";

const TopNavigation = ({ onToggleSidebar, onNewTask }) => {
    const user = useAuthStore((s) => s.user);
    const logout = useLogout();
    const initials =
        (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <nav className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} aria-label="Toggle sidebar">
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search tasks..." className="w-64 pl-9" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={onNewTask} size="sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Task</span>
                </Button>

                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{initials.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user?.firstName
                                        ? `${user.firstName} ${user.lastName || ""}`.trim()
                                        : user?.username || "Account"}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default TopNavigation;
