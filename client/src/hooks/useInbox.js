import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { taskKeys } from "./useTasks";

export const inboxKeys = {
    tasks: ["inbox", "tasks"],
};

export const useInboxTasks = () =>
    useQuery({
        queryKey: inboxKeys.tasks,
        queryFn: async () => {
            const { tasks } = await api("/inbox/tasks");
            return tasks;
        },
    });

export const useUpdateInboxTaskStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, taskId, status }) =>
            api(`/projects/${projectId}/tasks/${taskId}`, {
                method: "PATCH",
                body: { status },
            }),
        onSuccess: (_data, { projectId }) => {
            qc.invalidateQueries({ queryKey: inboxKeys.tasks });
            qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
        },
    });
};
