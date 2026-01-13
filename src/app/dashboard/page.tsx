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
    const now = new Date();

    // Formatter for YYYY-MM-DD
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    const todayStr = fmt.format(now);

    // Safe day of week detection (0=Sun, 1=Mon, ..., 6=Sat)
    const dayName = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
    const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const currentDayIdx = dayMap[dayName] ?? 0;
    const diffToMonday = currentDayIdx === 0 ? 6 : currentDayIdx - 1;

    // Calculate Monday of current week (local TZ)
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);

    const dayAbbreviations = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
    const trainingDates = new Set(progression.map(p => p.date));

    const weekProgress = dayAbbreviations.map((label, index) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + index);
        const dateStr = fmt.format(dayDate);

        const isTrained = trainingDates.has(dateStr);
        const isToday = dateStr === todayStr;
        const isPast = index < diffToMonday;

        let statusColor = "bg-zinc-800 text-zinc-500"; // Future/Today Default
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
