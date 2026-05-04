import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../lib/validations/auth";
import { useSignup } from "../hooks/useAuth";

const fieldClass =
    "glass-row w-full rounded-xl px-3 py-2.5 text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/50";

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
        <div className="min-h-screen flex items-center justify-center px-6 py-10">
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
                    <h1 className="text-3xl font-bold text-center mb-2 text-shadow">Get started</h1>
                    <p className="text-white/70 text-center mb-6">Create your Flow AI account</p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="firstName" className="block text-sm mb-1.5 text-white/85">First name</label>
                                <input id="firstName" {...register("firstName")} className={fieldClass} />
                                {errors.firstName && <p className="text-red-300 text-xs mt-1.5">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm mb-1.5 text-white/85">Last name</label>
                                <input id="lastName" {...register("lastName")} className={fieldClass} />
                                {errors.lastName && <p className="text-red-300 text-xs mt-1.5">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm mb-1.5 text-white/85">Username</label>
                            <input id="username" {...register("username")} className={fieldClass} />
                            {errors.username && <p className="text-red-300 text-xs mt-1.5">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm mb-1.5 text-white/85">Email</label>
                            <input id="email" type="email" placeholder="you@company.com" {...register("email")} className={fieldClass} />
                            {errors.email && <p className="text-red-300 text-xs mt-1.5">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm mb-1.5 text-white/85">Password</label>
                            <input id="password" type="password" {...register("password")} className={fieldClass} />
                            {errors.password && <p className="text-red-300 text-xs mt-1.5">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm mb-1.5 text-white/85">Confirm password</label>
                            <input id="confirmPassword" type="password" {...register("confirmPassword")} className={fieldClass} />
                            {errors.confirmPassword && <p className="text-red-300 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                        </div>

                        {signupMutation.isError && (
                            <p className="text-red-300 text-sm">{signupMutation.error.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:opacity-60 text-white py-3 rounded-xl btn-glow font-medium transition-all"
                        >
                            {signupMutation.isPending ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className="mt-7 text-center">
                        <p className="text-white/65 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-red-300 hover:text-red-200 transition-colors">
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
