'use client';

import { useState, useMemo } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

const PLATE_WEIGHTS = [25, 20, 15, 10, 5, 2.5, 1.25];

export function DiskCalculator() {
    const { t } = useTranslation();
    const [targetWeight, setTargetWeight] = useState<number>(60);
    const [barbellWeight, setBarbellWeight] = useState<number>(20);

    const platesPerSide = useMemo(() => {
        let remaining = (targetWeight - barbellWeight) / 2;
        if (remaining < 0) return [];

        const result: number[] = [];
        for (const weight of PLATE_WEIGHTS) {
            const count = Math.floor(remaining / weight);
            for (let i = 0; i < count; i++) {
                result.push(weight);
            }
            remaining %= weight;
        }
        return result;
    }, [targetWeight, barbellWeight]);

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <header className="flex items-center gap-3">
                <div className="rounded-full bg-brand-primary/10 p-2 text-brand-primary">
                    <Calculator className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold">{t('tools.disk_calculator.title')}</h3>
                    <p className="text-xs text-muted-foreground">
                        {t('tools.disk_calculator.subtitle', { weight: barbellWeight })}
                    </p>
                </div>
            </header>

            <div className="flex gap-2">
                <button
                    onClick={() => setBarbellWeight(20)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${barbellWeight === 20 ? 'bg-brand-primary text-white border-brand-primary' : 'bg-background hover:bg-accent border-input'}`}
                >
                    {t('tools.disk_calculator.bar_20')}
                </button>
                <button
                    onClick={() => setBarbellWeight(15)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${barbellWeight === 15 ? 'bg-brand-primary text-white border-brand-primary' : 'bg-background hover:bg-accent border-input'}`}
                >
                    {t('tools.disk_calculator.bar_15')}
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 sm:gap-4">
                    <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                        className="flex-1 h-12 sm:h-14 rounded-xl border bg-accent/5 px-3 sm:px-4 text-lg sm:text-2xl font-black text-center focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        placeholder={t('tools.disk_calculator.target_placeholder')}
                    />
                    <button
                        onClick={() => setTargetWeight(barbellWeight)}
                        className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 flex items-center justify-center rounded-xl bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                </div>

                {/* Bar Visualizer */}
                <div className="relative h-16 sm:h-20 bg-accent/5 rounded-xl flex items-center justify-center px-4 sm:px-10 overflow-hidden">
                    {/* Barbell sleeve */}
                    <div className="absolute left-0 w-full h-1 sm:h-2 bg-muted-foreground/20 z-0"></div>

                    <div className="relative z-10 flex flex-row-reverse items-center gap-1">
                        {platesPerSide.length > 0 ? (
                            platesPerSide.map((weight, i) => (
                                <div
                                    key={i}
                                    className="rounded-sm border-2 border-background shadow-sm transition-all"
                                    style={{
                                        height: `${40 + (weight * 1.5)}%`,
                                        width: `${Math.max(12, weight * 0.8)}px`,
                                        backgroundColor: getPlateColor(weight),
                                    }}
                                    title={`${weight}kg`}
                                ></div>
                            ))
                        ) : (
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/30">
                                {t('tools.disk_calculator.empty')}
                            </p>
                        )}
                    </div>
                </div>

                {/* List of plates */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                    {Object.entries(
                        platesPerSide.reduce((acc, w) => {
                            acc[w] = (acc[w] || 0) + 1;
                            return acc;
                        }, {} as Record<number, number>)
                    )
                        .sort((a, b) => Number(b[0]) - Number(a[0]))
                        .map(([weight, count]) => (
                            <div
                                key={weight}
                                className="flex items-center gap-1.5 sm:gap-2 rounded-lg border bg-accent/5 px-2 py-1 sm:px-3 sm:py-1.5 animate-in zoom-in-95 duration-200"
                            >
                                <div
                                    className="h-2 w-2 sm:h-3 sm:w-3 rounded-full"
                                    style={{ backgroundColor: getPlateColor(Number(weight)) }}
                                ></div>
                                <span className="text-xs sm:text-sm font-bold">{count}x</span>
                                <span className="text-xs sm:text-sm font-black">{weight}kg</span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

function getPlateColor(weight: number): string {
    switch (weight) {
        case 25: return '#ef4444'; // Red
        case 20: return '#3b82f6'; // Blue
        case 15: return '#eab308'; // Yellow
        case 10: return '#22c55e'; // Green
        case 5: return '#ffffff'; // White
        case 2.5: return '#000000'; // Black
        case 1.25: return '#94a3b8'; // gray
        default: return '#64748b';
    }
}
