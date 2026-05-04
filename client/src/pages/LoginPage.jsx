import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../lib/validations/auth";
import { useLogin } from "../hooks/useAuth";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from || "/dashboard";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(loginSchema) });

    const loginMutation = useLogin();

    const onSubmit = (values) =>
        loginMutation.mutate(values, {
            onSuccess: () => navigate(redirectTo, { replace: true }),
        });

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="relative z-10 w-full max-w-md">
                <Link
                    to="/"
                    className="inline-flex items-center text-white/65 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Link>

                <div className="glass-strong rounded-3xl p-8">
                    <div className="flex justify-center mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/40 text-white text-xl">
                            ✦
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-center mb-2 text-shadow">Welcome back</h1>
                    <p className="text-white/70 text-center mb-7">Sign in to your Flow AI account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm mb-1.5 text-white/85">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                {...register("email")}
                                className="glass-row w-full rounded-xl px-3 py-2.5 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                            {errors.email && (
                                <p className="text-red-300 text-xs mt-1.5">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm mb-1.5 text-white/85">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password")}
                                className="glass-row w-full rounded-xl px-3 py-2.5 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                            {errors.password && (
                                <p className="text-red-300 text-xs mt-1.5">{errors.password.message}</p>
                            )}
                        </div>

                        {loginMutation.isError && (
                            <p className="text-red-300 text-sm">{loginMutation.error.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:opacity-60 text-white py-3 rounded-xl btn-glow font-medium transition-all"
                        >
                            {loginMutation.isPending ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-7 text-center">
                        <p className="text-white/65 text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-red-300 hover:text-red-200 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
