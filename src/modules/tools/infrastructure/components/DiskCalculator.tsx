'use client';

import { useState, useMemo } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

const PLATE_WEIGHTS = [25, 20, 15, 10, 5, 2.5, 1.25];
const BARBELL_WEIGHT = 20;

export function DiskCalculator() {
    const [targetWeight, setTargetWeight] = useState<number>(60);

    const platesPerSide = useMemo(() => {
        let remaining = (targetWeight - BARBELL_WEIGHT) / 2;
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
    }, [targetWeight]);

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <header className="flex items-center gap-3">
                <div className="rounded-full bg-brand-primary/10 p-2 text-brand-primary">
                    <Calculator className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold">Calculadora de Discos</h3>
                    <p className="text-xs text-muted-foreground">Discos por lado (barra de 20kg)</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(Number(e.target.value))}
                        className="flex-1 h-14 rounded-xl border bg-accent/5 px-4 text-2xl font-black text-center focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        placeholder="Peso total (kg)"
                    />
                    <button
                        onClick={() => setTargetWeight(20)}
                        className="h-14 w-14 flex items-center justify-center rounded-xl bg-accent/20 text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="h-5 w-5" />
                    </button>
                </div>

                {/* Bar Visualizer */}
                <div className="relative h-20 bg-accent/5 rounded-xl flex items-center justify-center px-10 overflow-hidden">
                    {/* Barbell sleeve */}
                    <div className="absolute left-0 w-full h-2 bg-muted-foreground/20 z-0"></div>

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
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/30">Vacía</p>
                        )}
                    </div>
                </div>

                {/* List of plates */}
                <div className="flex flex-wrap gap-2 justify-center">
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
                                className="flex items-center gap-2 rounded-lg border bg-accent/5 px-3 py-1.5 animate-in zoom-in-95 duration-200"
                            >
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: getPlateColor(Number(weight)) }}
                                ></div>
                                <span className="text-sm font-bold">{count}x</span>
                                <span className="text-sm font-black">{weight}kg</span>
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
