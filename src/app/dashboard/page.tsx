export const dynamic = "force-dynamic";

import { getRoutinesAction, getProgressionDataAction } from "@/app/_actions/training";
import { ListChecks, Plus, History, Check } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    const headerList = await headers();
    const userTimezone = headerList.get('x-timezone') || 'Europe/Madrid'; // Fallback to Madrid if not detected

    const routines = await getRoutinesAction();
    const progression = await getProgressionDataAction(undefined, userTimezone);

    // Weekly Tracker Logic
    const tz = userTimezone;
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const nowLocalStr = formatter.format(new Date());
    const nowParts = nowLocalStr.split('-').map(Number);
    const nowLocal = new Date(nowParts[0], nowParts[1] - 1, nowParts[2]);

    // getDay() for current week logic needs to be relative to the local date
    // But since we want Monday-Sunday, we need to find Monday in that local perspective
    const currentDay = (new Date(new Date().toLocaleString('en-US', { timeZone: tz }))).getDay();
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(nowLocal);
    monday.setDate(nowLocal.getDate() - diffToMonday);

    const dayAbbreviations = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
    const trainingDates = new Set(progression.map(p => p.date));

    const weekProgress = dayAbbreviations.map((label, index) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + index);
        const dateStr = formatter.format(dayDate);
        const isTrained = trainingDates.has(dateStr);
        const isPast = index < diffToMonday;
        const isToday = index === diffToMonday;

        let statusColor = "bg-zinc-800 text-zinc-500"; // Default
        if (isTrained) {
            statusColor = "bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]";
        } else if (isPast) {
            statusColor = "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]";
        }

        return { label, statusColor, isTrained };
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {error && (
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 text-red-600" />
                        <div>
                            <h3 className="font-bold text-red-900">No se pudo iniciar la sesión</h3>
                            <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">DataGym</h1>
                    <p className="text-muted-foreground">Tu cuaderno de fuerza inteligente.</p>
                </div>
            </header>

            <div className="grid gap-8">
                <div className="space-y-8">
                    {/* Weekly Tracker */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-brand-primary" />
                            Actividad Semanal
                        </h2>
                        <div className="bg-card border rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center gap-2">
                                {weekProgress.map((day, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase">{day.label}</span>
                                        <div className={`w-full aspect-square max-w-[48px] rounded-xl flex items-center justify-center transition-all shadow-inner ${day.statusColor}`}>
                                            {day.isTrained && <Check className="h-5 w-5" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mis Rutinas */}
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
                                    href={`/dashboard/session?routineId=${routine.id}`}
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
                </div>
            </div>
        </div>
    );
}
