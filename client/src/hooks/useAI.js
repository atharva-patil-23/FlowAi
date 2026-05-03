import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useGenerateTasks = (projectId) =>
    useMutation({
        mutationFn: (values) =>
            api(`/projects/${projectId}/ai/generate-tasks`, {
                method: "POST",
                body: values,
            }),
    });
