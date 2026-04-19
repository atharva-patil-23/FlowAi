import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export const projectKeys = {
    all: ["projects"],
    detail: (id) => ["projects", id],
};

export const useProjects = () =>
    useQuery({
        queryKey: projectKeys.all,
        queryFn: async () => {
            const { projects } = await api("/projects");
            return projects;
        },
    });

export const useProject = (projectId) =>
    useQuery({
        queryKey: projectKeys.detail(projectId),
        queryFn: async () => {
            const { project } = await api(`/projects/${projectId}`);
            return project;
        },
        enabled: Boolean(projectId),
    });

export const useCreateProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values) => api("/projects", { method: "POST", body: values }),
        onSuccess: ({ project }) => {
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.setQueryData(projectKeys.detail(project.id || project._id), project);
        },
    });
};

export const useUpdateProject = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values) =>
            api(`/projects/${projectId}`, { method: "PATCH", body: values }),
        onSuccess: ({ project }) => {
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.setQueryData(projectKeys.detail(projectId), project);
        },
    });
};

export const useDeleteProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (projectId) =>
            api(`/projects/${projectId}`, { method: "DELETE" }),
        onSuccess: (_data, projectId) => {
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.removeQueries({ queryKey: projectKeys.detail(projectId) });
        },
    });
};

export const useAddProjectMember = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (values) =>
            api(`/projects/${projectId}/members`, { method: "POST", body: values }),
        onSuccess: ({ project }) => {
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.setQueryData(projectKeys.detail(projectId), project);
        },
    });
};

export const useRemoveProjectMember = (projectId) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (memberId) =>
            api(`/projects/${projectId}/members/${memberId}`, { method: "DELETE" }),
        onSuccess: ({ project }) => {
            qc.invalidateQueries({ queryKey: projectKeys.all });
            qc.setQueryData(projectKeys.detail(projectId), project);
        },
    });
};
