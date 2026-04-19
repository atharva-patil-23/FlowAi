import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "@/components/dashboard/Sidebar.jsx";
import TopNavigation from "@/components/dashboard/TopNavigation.jsx";
import DashboardHome from "@/components/dashboard/DashboardHome.jsx";

const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            <Sidebar collapsed={sidebarCollapsed} />

            <div className="flex min-w-0 flex-1 flex-col">
                <TopNavigation onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />

                <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="projects/:projectId" element={<div>Project detail coming in Phase 5</div>} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
