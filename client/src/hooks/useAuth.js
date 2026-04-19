import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export const useSignup = () => {
    const setAuth = useAuthStore((s) => s.setAuth);
    return useMutation({
        mutationFn: (values) => api("/auth/signup", { method: "POST", body: values }),
        onSuccess: ({ user, token }) => setAuth({ user, token }),
    });
};

export const useLogin = () => {
    const setAuth = useAuthStore((s) => s.setAuth);
    return useMutation({
        mutationFn: (values) => api("/auth/login", { method: "POST", body: values }),
        onSuccess: ({ user, token }) => setAuth({ user, token }),
    });
};

export const useMe = () => {
    const token = useAuthStore((s) => s.token);
    const setUser = useAuthStore((s) => s.setUser);
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const { user } = await api("/auth/me");
            setUser(user);
            return user;
        },
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
    });
};

export const useLogout = () => {
    const clearAuth = useAuthStore((s) => s.clearAuth);
    return () => clearAuth();
};
