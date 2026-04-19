import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../lib/validations/auth";
import { useSignup } from "../hooks/useAuth";

const SignupPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(signupSchema) });

    const signupMutation = useSignup();

    const onSubmit = ({ confirmPassword, ...values }) =>
        signupMutation.mutate(values, {
            onSuccess: () => navigate("/dashboard", { replace: true }),
        });

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-10">
            <div className="relative z-10 w-full max-w-md">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Link>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-2">Get Started</h1>
                    <p className="text-gray-400 text-center mb-6">Create your Flow AI account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="firstName" className="block text-sm mb-1">First name</label>
                                <input
                                    id="firstName"
                                    {...register("firstName")}
                                    className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                                />
                                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm mb-1">Last name</label>
                                <input
                                    id="lastName"
                                    {...register("lastName")}
                                    className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                                />
                                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm mb-1">Username</label>
                            <input
                                id="username"
                                {...register("username")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                {...register("email")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm mb-1">Password</label>
                            <input
                                id="password"
                                type="password"
                                {...register("password")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm mb-1">Confirm password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className="bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none w-full p-2 rounded-md"
                            />
                            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {signupMutation.isError && (
                            <p className="text-red-400 text-sm">{signupMutation.error.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-3 rounded-md transition-colors"
                        >
                            {signupMutation.isPending ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{" "}
                            <Link to="/login" className="text-red-500 hover:text-red-400 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
