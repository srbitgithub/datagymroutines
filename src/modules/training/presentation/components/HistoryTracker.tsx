'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from "@/core/i18n/TranslationContext";
import { Check, Calendar } from 'lucide-react';
import {
    format,
    startOfWeek,
    isSameDay,
    isPast,
    isToday,
    subWeeks,
    subDays,
    eachDayOfInterval,
    endOfWeek,
    isAfter
} from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface HistoryTrackerProps {
    progressionItems: { date: string }[];
}

type Period = 'this_week' | 'last_week' | 'this_month';

export function HistoryTracker({ progressionItems }: HistoryTrackerProps) {
    const { t, language } = useTranslation();
    const [period, setPeriod] = useState<Period>('this_week');
    const now = new Date();

    const locale = language === 'es' ? es : enUS;
    const trainingDates = useMemo(() => new Set(progressionItems.map(p => p.date)), [progressionItems]);

    const days = useMemo(() => {
        let start: Date;
        let end: Date;

        switch (period) {
            case 'this_week':
                start = startOfWeek(now, { weekStartsOn: 1 });
                end = endOfWeek(now, { weekStartsOn: 1 });
                break;
            case 'last_week':
                const lastWeek = subWeeks(now, 1);
                start = startOfWeek(lastWeek, { weekStartsOn: 1 });
                end = endOfWeek(lastWeek, { weekStartsOn: 1 });
                break;
            case 'this_month':
                start = subDays(now, 29); // Last 30 days
                end = now;
                break;
            default:
                start = startOfWeek(now, { weekStartsOn: 1 });
                end = endOfWeek(now, { weekStartsOn: 1 });
        }

        return eachDayOfInterval({ start, end });
    }, [period]);

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-brand-primary" />
                    {t('dashboard.workout_history')}
                </h2>

                <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 self-start sm:self-auto">
                    {(['this_week', 'last_week', 'this_month'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${period === p
                                ? 'bg-brand-primary text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {t(`dashboard.periods.${p}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm overflow-x-auto">
                <div className={`flex flex-wrap gap-2 sm:gap-3 ${period === 'this_month' ? 'justify-start' : 'justify-between'}`}>
                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isTrained = trainingDates.has(dateStr);
                        const isPastDay = isPast(day) && !isToday(day);
                        const isFuture = isAfter(day, now);
                        const today = isToday(day);

                        let statusStyles = "bg-zinc-800/30 text-zinc-600 border-transparent";
                        if (isTrained) {
                            statusStyles = "bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] border-green-400/20";
                        } else if (today) {
                            statusStyles = "bg-brand-primary/10 text-brand-primary border-brand-primary/30 ring-1 ring-brand-primary/20";
                        } else if (isPastDay) {
                            statusStyles = "bg-red-600/10 text-red-500/30 border-red-500/10";
                        }

                        return (
                            <div key={dateStr} className="flex flex-col items-center gap-2 flex-shrink-0">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter opacity-70">
                                    {format(day, 'EEE', { locale })}
                                </span>
                                <div
                                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${statusStyles} ${today ? 'animate-pulse' : ''}`}
                                    title={format(day, 'PPP', { locale })}
                                >
                                    {isTrained ? (
                                        <Check className="h-4 w-4 sm:h-5 sm:w-5 stroke-[4px]" />
                                    ) : (
                                        <span className={`text-[10px] font-black ${today ? 'text-brand-primary' : ''}`}>{format(day, 'd')}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
