'use client';

import { useState } from "react";
import { loginAdminAction } from "@/app/_actions/admin";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await loginAdminAction(password);
            if (result.success) {
                router.push("/admin/dashboard");
            } else {
                setError(result.error || "Error al iniciar sesión");
            }
        } catch (err) {
            setError("Ocurrió un error inesperado");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary/10 mb-6">
                        <ShieldCheck className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Panel</h1>
                    <p className="text-zinc-400 mt-2 font-medium">Acceso restringido para administración</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-500 uppercase ml-1">Contraseña Maestra</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all font-mono"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            "Entrar al Sistema"
                        )}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">IronMetric v1.0 Admin</p>
                </div>
            </div>
        </div>
    );
}
