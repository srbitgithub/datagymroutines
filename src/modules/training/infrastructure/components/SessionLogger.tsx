'use client';

import { useState, useEffect } from 'react';
import { TrainingSession, ExerciseSet } from '../../domain/Session';
import { Dumbbell, Plus, Check, Clock, Save, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SessionLoggerProps {
    session: TrainingSession;
}

export function SessionLogger({ session }: SessionLoggerProps) {
    const router = useRouter();
    const [sets, setSets] = useState<ExerciseSet[]>(session.sets || []);
    const [elapsed, setElapsed] = useState(0);

    // Simple Timer
    useEffect(() => {
        const timer = setInterval(() => {
            const start = new Date(session.startTime).getTime();
            const now = new Date().getTime();
            setElapsed(Math.floor((now - start) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [session.startTime]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addSet = (exerciseId: string) => {
        const newSet: ExerciseSet = {
            id: crypto.randomUUID(),
            sessionId: session.id,
            exerciseId,
            weight: 0,
            reps: 0,
            type: 'normal',
            orderIndex: sets.filter(s => s.exerciseId === exerciseId).length,
            createdAt: new Date(),
        };
        setSets([...sets, newSet]);
        // In a real app, we would call an action here to save to the DB immediately
    };

    const updateSet = (id: string, field: keyof ExerciseSet, value: any) => {
        setSets(sets.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSet = (id: string) => {
        setSets(sets.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6 pb-40">
            <header className="sticky top-0 z-30 flex items-center justify-between bg-background/80 backdrop-blur-md border-b p-4 -mx-6 md:mx-0 md:rounded-xl md:border mb-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-primary/10 p-2">
                        <Clock className="h-5 w-5 text-brand-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">En curso</p>
                        <p className="text-xl font-black tabular-nums">{formatTime(elapsed)}</p>
                    </div>
                </div>
                <button
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-4 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
                    onClick={() => router.push('/dashboard')}
                >
                    <Check className="mr-2 h-4 w-4" />
                    Finalizar
                </button>
            </header>

            {/* Mocking exercises for now or getting them from session.routine */}
            {/* Since we don't have the full join here, let's assume session has routine exercises */}
            <div className="space-y-8">
                <p className="text-muted-foreground text-sm italic">
                    (Interfaz de registro de series en desarrollo...)
                </p>

                {/* Example Exercise block */}
                <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                    <div className="p-4 bg-accent/5 border-b flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-brand-primary" />
                            Press de Banca
                        </h3>
                        <button
                            onClick={() => addSet('placeholder-id')}
                            className="text-xs font-bold uppercase text-brand-primary hover:bg-brand-primary/10 px-2 py-1 rounded transition-colors"
                        >
                            + Añadir Serie
                        </button>
                    </div>

                    <div className="p-0">
                        <table className="w-full text-center border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase text-muted-foreground border-b bg-muted/30">
                                    <hr className="w-8 p-2">SET</hr>
                                    <th className="p-2">PESO (KG)</th>
                                    <th className="p-2">REPS</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((setNum) => (
                                    <tr key={setNum} className="border-b last:border-0 hover:bg-accent/5 transition-colors">
                                        <td className="p-3 text-xs font-bold text-muted-foreground">{setNum}</td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 text-muted-foreground">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
