import { Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

const DashboardHome = () => {
    const user = useAuthStore((s) => s.user);
    const firstName = user?.firstName || user?.username || "there";

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
                <p className="text-muted-foreground">Pick a project from the sidebar or create a new one.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Getting started
                    </CardTitle>
                    <CardDescription>Flow AI helps you turn goals into tasks with Claude.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Projects, tasks, realtime collaboration and AI-powered task suggestions are wired up across the
                    next phases. Create your first project from the sidebar to begin.
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardHome;
