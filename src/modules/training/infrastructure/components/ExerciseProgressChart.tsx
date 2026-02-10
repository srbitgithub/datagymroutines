'use client';

import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';
import { useTranslation, Language } from '@/core/i18n/TranslationContext';

interface ProgressPoint {
    date: string;
    weight: number;
    reps: number;
    maxReps?: number;
}

interface ExerciseProgressChartProps {
    data: ProgressPoint[];
    exerciseName: string;
    loggingType: 'strength' | 'time' | 'bodyweight';
}

const CustomTooltip = ({ active, payload, label, language, t, loggingType }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as ProgressPoint;
        const locale = language === 'es' ? es : enUS;

        const formatTime = (seconds: number) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
        };

        return (
            <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
                <p className="text-[10px] font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(label), t('stats.date_format'), { locale })}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-brand-primary">
                        {loggingType === 'time' ? formatTime(payload[0].value) : payload[0].value}
                    </span>
                    <span className="text-sm font-bold text-zinc-400">
                        {loggingType === 'time' ? '' : 'kg'}
                    </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                    {loggingType === 'time'
                        ? (data.weight > 0 ? `${t('training.weight')}: ${data.weight}kg` : '')
                        : t('stats.best_set', { reps: data.reps })}
                </p>
            </div>
        );
    }
    return null;
};

export function ExerciseProgressChart({ data, exerciseName, loggingType }: ExerciseProgressChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { t, language } = useTranslation();
    const dateLocale = language === 'es' ? es : enUS;

    const stats = useMemo(() => {
        if (data.length === 0) return null;

        const mainDataKey = loggingType === 'time' ? 'maxReps' : 'weight';
        const values = data.map(d => (d as any)[mainDataKey] || 0);

        const max = Math.max(...values);
        const first = values[0];
        const last = values[values.length - 1];
        const diff = last - first;
        const percent = first > 0 ? (diff / first) * 100 : 0;

        return { max, diff, percent };
    }, [data, loggingType]);

    const formatTimeFull = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
                <TrendingUp className="h-10 w-10 text-zinc-700 mb-4" />
                <h3 className="text-lg font-bold text-zinc-400">{t('stats.not_enough_data')}</h3>
                <p className="text-sm text-zinc-500 max-w-xs mt-1">
                    {t('stats.not_enough_data_desc')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-2xl border bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Trophy className="h-12 w-12 text-yellow-500" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('stats.personal_record')}</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">
                            {loggingType === 'time' ? formatTimeFull(stats?.max || 0) : stats?.max}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                            {loggingType === 'time' ? '' : 'kg'}
                        </span>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-2xl border bg-zinc-900/50 p-4 backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <TrendingUp className="h-12 w-12 text-brand-primary" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{t('stats.total_progression')}</p>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${stats && stats.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {loggingType === 'time'
                                ? `${stats && stats.diff >= 0 ? '+' : ''}${formatTimeFull(Math.abs(stats?.diff || 0))}`
                                : `${stats && stats.diff >= 0 ? '+' : ''}${stats?.diff}`}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                            {loggingType === 'time' ? '' : 'kg'}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500">
                        ({stats && stats.percent >= 0 ? '+' : ''}{stats?.percent.toFixed(1)}%)
                    </p>
                </div>
            </div>

            {/* Main Chart Container */}
            <div className="relative h-[350px] w-full rounded-2xl border bg-zinc-950 p-6 shadow-2xl">
                <div className="absolute top-6 left-6 z-10">
                    <h3 className="text-sm font-bold text-white uppercase tracking-tighter">{exerciseName}</h3>
                    <p className="text-[10px] font-medium text-zinc-500">
                        {loggingType === 'time' ? t('stats.evolution_time') : t('stats.evolution_max_weight')}
                    </p>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 40, right: 10, left: -20, bottom: 0 }}
                        onMouseMove={(state) => {
                            if (state.activeTooltipIndex !== undefined) {
                                setHoveredIndex(state.activeTooltipIndex as number);
                            }
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="#ffffff05"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(str) => format(parseISO(str), 'd MMM', { locale: dateLocale })}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                            content={<CustomTooltip language={language} t={t} loggingType={loggingType} />}
                            cursor={{ stroke: '#facc1533', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={loggingType === 'time' ? 'maxReps' : 'weight'}
                            stroke="#facc15"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                            animationDuration={1500}
                            activeDot={{
                                r: 6,
                                stroke: '#000',
                                strokeWidth: 2,
                                fill: '#facc15',
                                className: "shadow-glow"
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <style jsx global>{`
                .shadow-glow {
                    filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.8));
                }
            `}</style>
        </div>
    );
}
