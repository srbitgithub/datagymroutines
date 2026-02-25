'use client';

import { useState, useEffect } from "react";
import { getRoutinesAction, getProgressionDataAction } from "@/app/_actions/training";
import { getProfileAction } from "@/app/_actions/auth";
import { ListChecks, Plus, History, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/core/i18n/TranslationContext";
import { Routine } from "@/modules/training/domain/Routine";
import { HistoryTracker } from "@/modules/training/presentation/components/HistoryTracker";
import { ContextualTooltip } from "@/modules/core/presentation/components/ContextualTooltip";

export default function DashboardPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ error?: string }> }) {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [progressionItems, setProgressionItems] = useState<any[]>([]);
    const [monthlyGoal, setMonthlyGoal] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, ta } = useTranslation();

    useEffect(() => {
        const load = async () => {
            try {
                const params = await searchParamsPromise;
                if (params.error) setError(decodeURIComponent(params.error));

                const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
                const [routinesData, progressionData, profileData] = await Promise.all([
                    getRoutinesAction(),
                    getProgressionDataAction(undefined, userTimezone),
                    getProfileAction()
                ]);

                setRoutines(routinesData);
                setProgressionItems(progressionData.items);
                setMonthlyGoal(profileData?.monthlyGoal || 20);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [searchParamsPromise]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <p className="mt-4 text-muted-foreground font-medium">{t('common.loading')}</p>
            </div>
        );
    }

    // Monthly Logic for Summary
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
    const now = new Date();
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const currentMonth = localNow.getMonth();
    const currentYear = localNow.getFullYear();
    const monthNames = ta('common.months');
    const currentMonthName = monthNames[currentMonth];

    const trainingDates = new Set(progressionItems.map(p => p.date));
    const daysTrainedThisMonth = Array.from(trainingDates).filter(dateStr => {
        const [y, m] = dateStr.split('-').map(Number);
        return y === currentYear && m === (currentMonth + 1);
    }).length;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-10">
            {error && (
                <div className="rounded-2xl border-l-4 border-red-500 bg-red-500/10 p-6 shadow-sm backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-red-500 text-sm">Error</h3>
                            <p className="text-sm text-zinc-300 font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <ContextualTooltip id="tooltip_dashboard" title="Centro de mando" message="Aquí verás rápidamente si estás cumpliendo tus objetivos del mes." />
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight uppercase">{t('dashboard.title')}</h1>
                    <p className="text-muted-foreground font-medium text-lg italic">{t('dashboard.subtitle')}</p>
                </div>
            </header>

            <div className="grid gap-10">
                <div className="space-y-10">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* History Tracker */}
                        <div className="md:col-span-2">
                            <HistoryTracker progressionItems={progressionItems} monthlyGoal={monthlyGoal} />
                        </div>

                        {/* Monthly Summary */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                                <ListChecks className="h-4 w-4 text-brand-secondary" />
                                {t('dashboard.monthly_summary', { month: currentMonthName })}
                            </h2>
                            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[160px] backdrop-blur-sm">
                                <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <History className="h-32 w-32" />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-6xl font-black text-brand-primary tracking-tighter">{daysTrainedThisMonth}</span>
                                    <p className="text-[11px] font-black text-brand-primary/60 uppercase tracking-[0.2em] mt-2">{t('dashboard.days_trained')}</p>
                                </div>
                                <div className="mt-8 w-full h-1.5 bg-zinc-200/10 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-brand-primary transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                        style={{ width: `${Math.min((daysTrainedThisMonth / monthlyGoal) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground mt-3 uppercase tracking-wider">
                                    {t('dashboard.monthly_goal', { goal: monthlyGoal })}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Mis Rutinas */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">{t('dashboard.my_routines')}</h2>
                            <Link href="/dashboard/routines" className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-white transition-colors bg-brand-primary/10 px-3 py-1.5 rounded-full">
                                {t('dashboard.view_all')}
                            </Link>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {routines.slice(0, 4).map((routine) => (
                                <Link
                                    key={routine.id}
                                    href={`/dashboard/session?routineId=${routine.id}`}
                                    className="group relative rounded-2xl border bg-zinc-900/30 p-6 hover:border-brand-primary/50 transition-all hover:shadow-2xl hover:shadow-brand-primary/5 backdrop-blur-sm animate-in zoom-in-95 duration-300"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="rounded-xl bg-brand-primary/10 p-2 group-hover:bg-brand-primary/20 transition-colors">
                                            <ListChecks className="h-5 w-5 text-brand-primary" />
                                        </div>
                                    </div>
                                    <h3 className="font-black text-lg truncate uppercase tracking-tight">{routine.name}</h3>
                                    <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-wider">
                                        {t('dashboard.num_exercises', { count: routine.exercises.length })}
                                    </p>
                                </Link>
                            ))}
                            {routines.length === 0 && (
                                <div className="sm:col-span-1 lg:col-span-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-primary/20 bg-brand-primary/5 p-6 text-center min-h-[160px]">
                                    <div className="bg-brand-primary/10 p-3 rounded-full mb-3">
                                        <ListChecks className="h-6 w-6 text-brand-primary" />
                                    </div>
                                    <h3 className="font-black text-sm uppercase tracking-tight mb-1">Tu centro de mando está vacío</h3>
                                    <p className="text-xs text-muted-foreground max-w-[250px]">
                                        Crea una rutina para empezar a registrar.
                                    </p>
                                </div>
                            )}
                            <Link
                                href="/dashboard/routines/new"
                                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/10 p-6 text-zinc-500 hover:text-brand-primary hover:border-brand-primary transition-all hover:bg-brand-primary/5 group animate-in zoom-in-95 duration-300"
                            >
                                <div className="bg-zinc-800 p-3 rounded-full group-hover:bg-brand-primary/20 transition-colors mb-3">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">{t('dashboard.new_routine')}</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
