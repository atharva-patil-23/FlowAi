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
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Link>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-center mb-8">Sign in to your Flow AI account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                {...register("email")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {loginMutation.isError && (
                            <p className="text-red-400 text-sm">{loginMutation.error.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-md transition-colors"
                        >
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-red-500 hover:text-red-400 transition-colors">
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
