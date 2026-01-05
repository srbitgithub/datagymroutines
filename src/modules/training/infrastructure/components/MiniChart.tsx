'use client';

import { useMemo } from 'react';

interface Point {
    date: string;
    value: number;
}

interface MiniChartProps {
    data: Point[];
    label: string;
    color?: string;
}

export function MiniChart({ data, label, color = "#ef4444" }: MiniChartProps) {
    const points = useMemo(() => {
        if (data.length < 2) return "";

        const max = Math.max(...data.map(p => p.value));
        const min = Math.min(...data.map(p => p.value));
        const range = max - min || 1;

        const width = 200;
        const height = 40;
        const padding = 5;

        return data.map((p, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - padding - ((p.value - min) / range) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(" ");
    }, [data]);

    return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-xl font-black">
                        {data.length > 0 ? data[data.length - 1].value : 0}
                        <span className="text-xs font-normal text-muted-foreground ml-1">kg</span>
                    </p>
                </div>
                {data.length > 1 && (
                    <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold ${data[data.length - 1].value >= data[data.length - 2].value ? 'text-green-500' : 'text-red-500'}`}>
                            {data[data.length - 1].value >= data[data.length - 2].value ? '↑' : '↓'}
                            {Math.abs(Math.round(((data[data.length - 1].value / data[data.length - 2].value) - 1) * 100))}%
                        </span>
                    </div>
                )}
            </div>

            <div className="h-10 w-full">
                {data.length > 1 ? (
                    <svg className="h-full w-full overflow-visible" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 0,40 L ${points} L 200,40 Z`}
                            fill={`url(#grad-${label})`}
                            className="animate-in fade-in duration-700"
                        />
                        <polyline
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={points}
                            className="animate-in fade-in slide-in-from-right-10 duration-500"
                        />
                    </svg>
                ) : (
                    <div className="h-full w-full flex items-center justify-center border-t border-dashed border-muted/50">
                        <p className="text-[10px] text-muted-foreground italic">Datos insuficientes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
