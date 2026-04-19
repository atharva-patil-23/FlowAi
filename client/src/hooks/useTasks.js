import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const taskKeys = {
    all: (projectId) => ["tasks", projectId],
};

export const useTasks = (projectId) =>
    useQuery({
        queryKey: taskKeys.all(projectId),
        queryFn: async () => {
            const { tasks } = await api(`/projects/${projectId}/tasks`);
            return tasks;
        },
        enabled: Boolean(projectId),
    });

export const useCreateTask = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values) =>
            api(`/projects/${projectId}/tasks`, { method: "POST", body: values }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
        },
    });
};

export const useUpdateTask = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, values }) =>
            api(`/projects/${projectId}/tasks/${taskId}`, { method: "PATCH", body: values }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
        },
    });
};

export const useDeleteTask = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (taskId) =>
            api(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: taskKeys.all(projectId) });
        },
    });
};
