import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getSocket } from "@/lib/socket";
import { projectKeys } from "@/hooks/useProjects";
import { taskKeys } from "@/hooks/useTasks";

export const useProjectRealtime = (projectId) => {
    const qc = useQueryClient();

    useEffect(() => {
        if (!projectId) return;
        const socket = getSocket();
        if (!socket) return;

        const join = () =>
            socket.emit("join:project", projectId, (ack) => {
                if (!ack?.ok && ack?.error) {
                    console.warn("Socket join failed:", ack.error);
                }
            });

        if (socket.connected) join();
        socket.on("connect", join);

        const invalidateTasks = () =>
            qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
        const invalidateProject = () =>
            qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
        const invalidateAll = () => {
            invalidateTasks();
            invalidateProject();
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.invalidateQueries({ queryKey: ["inbox"] });
        };

        socket.on("task:created", invalidateTasks);
        socket.on("task:updated", invalidateTasks);
        socket.on("task:deleted", invalidateTasks);
        socket.on("project:updated", invalidateProject);
        socket.on("member:added", invalidateProject);
        socket.on("member:removed", invalidateAll);
        socket.on("project:deleted", invalidateAll);

        return () => {
            socket.emit("leave:project", projectId);
            socket.off("connect", join);
            socket.off("task:created", invalidateTasks);
            socket.off("task:updated", invalidateTasks);
            socket.off("task:deleted", invalidateTasks);
            socket.off("project:updated", invalidateProject);
            socket.off("member:added", invalidateProject);
            socket.off("member:removed", invalidateAll);
            socket.off("project:deleted", invalidateAll);
        };
    }, [projectId, qc]);
};
