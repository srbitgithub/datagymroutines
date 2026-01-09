export const dynamic = "force-dynamic";

import { getExercisesAction, getRoutinesAction, getProgressionDataAction } from "@/app/_actions/training";
import { ListChecks, Plus, Play, History, Dumbbell, TrendingUp } from "lucide-react";
import Link from "next/link";
import { MiniChart } from "@/modules/training/infrastructure/components/MiniChart";
import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { AlertCircle } from "lucide-react";

export default async function DashboardPage() {
    const routines = await getRoutinesAction();
    const exercises = await getExercisesAction();
    const progression = await getProgressionDataAction();
    const authRepository = new SupabaseAuthRepository();
    const authUser = await authRepository.getSession();

    const volumeData = progression.map(p => ({ date: p.date, value: p.volume }));
    const strengthData = progression.map(p => ({ date: p.date, value: p.max1RM }));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* PANEL DE DIAGNÓSTICO TEMPORAL */}
            <div className="rounded-xl border-2 border-brand-primary/20 bg-brand-primary/5 p-4 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-brand-primary">
                    <AlertCircle className="h-5 w-5" />
                    <h2 className="font-black uppercase tracking-wider text-sm">Panel de Diagnóstico</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                    <div>
                        <p className="text-muted-foreground">SESIÓN ACTIVA:</p>
                        <p className={authUser ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {authUser ? "SÍ (AUTENTICADO)" : "NO (NULO)"}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">USER ID:</p>
                        <p className="truncate" title={authUser?.id || "N/A"}>{authUser?.id || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">RUTINAS CARGADAS:</p>
                        <p className="font-bold">{routines.length}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">NEXT.JS VERSION:</p>
                        <p>16.1.1</p>
                    </div>
                </div>
            </div>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">DataGym</h1>
                    <p className="text-muted-foreground">Tu cuaderno de fuerza inteligente.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/session/start"
                        className="flex-1 md:flex-none inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-6 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-primary/90 active:scale-95"
                    >
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Empezar Sesión
                    </Link>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <MiniChart
                    data={volumeData}
                    label="Volumen Total"
                    color="#3b82f6"
                />
                <MiniChart
                    data={strengthData}
                    label="Fuerza Estimada (1RM)"
                    color="#ef4444"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Quick Stats Placeholder */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-brand-primary mb-1">{routines.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rutinas</span>
                </div>
                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-brand-primary mb-1">{exercises.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ejercicios</span>
                </div>
                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-brand-primary mb-1">0</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sesiones</span>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                <div className="space-y-8">
                    {/* Active / Recent Routines */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Mis Rutinas</h2>
                            <Link href="/dashboard/routines" className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline">
                                Ver todas
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {routines.slice(0, 4).map((routine) => (
                                <Link
                                    key={routine.id}
                                    href={`/dashboard/session/start?routineId=${routine.id}`}
                                    className="group rounded-xl border bg-card p-5 hover:border-brand-primary/50 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="rounded-full bg-brand-primary/5 p-2 group-hover:bg-brand-primary/10">
                                            <ListChecks className="h-4 w-4 text-brand-primary" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold">{routine.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{routine.exercises.length} ejercicios</p>
                                </Link>
                            ))}
                            <Link
                                href="/dashboard/routines/new"
                                className="flex flex-col items-center justify-center rounded-xl border border-dashed p-5 text-muted-foreground hover:text-brand-primary hover:border-brand-primary transition-all"
                            >
                                <Plus className="h-6 w-6 mb-2" />
                                <span className="text-sm font-medium">Nueva Rutina</span>
                            </Link>
                        </div>
                    </section>

                    {/* History Placeholder */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight">Historial Reciente</h2>
                        <div className="flex flex-col items-center justify-center rounded-2xl border bg-accent/5 p-12 text-center">
                            <History className="h-8 w-8 text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">No hay sesiones registradas todavía.</p>
                        </div>
                    </section>
                </div>

                <aside className="space-y-8">
                    {/* Exercises card */}
                    <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <Dumbbell className="h-4 w-4" />
                                Biblioteca
                            </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Gestiona tus ejercicios y grupos musculares.
                        </p>
                        <Link
                            href="/dashboard/exercises"
                            className="inline-flex w-full h-9 items-center justify-center rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
                        >
                            Ir a Ejercicios
                        </Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
