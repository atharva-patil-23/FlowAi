import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "@/components/dashboard/Sidebar.jsx";
import TopNavigation from "@/components/dashboard/TopNavigation.jsx";

const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen w-full text-foreground p-4 gap-4">
            <Sidebar collapsed={sidebarCollapsed} />

            <div className="flex min-w-0 flex-1 flex-col gap-4">
                <TopNavigation onToggleSidebar={() => setSidebarCollapsed((v) => !v)} />

                <main className="flex-1 overflow-y-auto px-2 pb-2">
                    <Outlet key={location.pathname} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
