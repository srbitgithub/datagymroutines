'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, ExerciseSet } from '../../domain/Session';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Plus, Check, Clock, Save, X, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { addSetAction, finishSessionAction, updateSetAction } from '@/app/_actions/training';

import { Routine } from '../../domain/Routine';

interface SessionLoggerProps {
    session: TrainingSession;
    exercises: Exercise[];
    routine: Routine | null;
}

export function SessionLogger({ session, exercises, routine }: SessionLoggerProps) {
    const router = useRouter();
    const [sets, setSets] = useState<ExerciseSet[]>(session.sets || []);
    const [elapsed, setElapsed] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAddingSet, setIsAddingSet] = useState<string | null>(null);

    // Sync state when props change (after router.refresh)
    useEffect(() => {
        setSets(session.sets || []);
    }, [session.sets]);

    // Map to get exercise names easily
    const exerciseMap = exercises.reduce((acc, ex) => {
        acc[ex.id] = ex;
        return acc;
    }, {} as Record<string, Exercise>);

    // Group sets by exercise
    const groupedSets = sets.reduce((acc, set) => {
        if (!acc[set.exerciseId]) acc[set.exerciseId] = [];
        acc[set.exerciseId].push(set);
        return acc;
    }, {} as Record<string, ExerciseSet[]>);


    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addSet = async (exerciseId: string) => {
        setIsAddingSet(exerciseId);
        const orderIndex = (groupedSets[exerciseId]?.length || 0);

        const result = (await addSetAction({
            sessionId: session.id,
            exerciseId,
            weight: 0,
            reps: 0,
            type: 'normal',
            orderIndex,
        })) as any;

        if (result.success && result.setId) {
            // Optimistic/Local update to show immediately
            const newSet: ExerciseSet = {
                id: result.setId,
                sessionId: session.id,
                exerciseId,
                weight: 0,
                reps: 0,
                type: 'normal',
                orderIndex,
                createdAt: new Date()
            };
            setSets(prev => [...prev, newSet]);
            router.refresh();
        }
        setIsAddingSet(null);
    };

    const updateSetData = async (setId: string, field: 'weight' | 'reps', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        // Optimistic update
        setSets(prev => prev.map(s => s.id === setId ? { ...s, [field]: numValue } : s));

        await updateSetAction(setId, { [field]: numValue });
    };

    const handleFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        const result = await finishSessionAction(session.id);
        if (result.success) {
            router.replace('/dashboard');
            router.refresh();
        } else {
            setIsFinishing(false);
        }
    };

    // Combine routine exercises with actual sets
    // We want to show every exercise from the routine, plus any extra ones the user added
    const routineExerciseIds = routine?.exercises.map((re: any) => re.exerciseId) || [];
    const exerciseIdsWithSets = Object.keys(groupedSets);
    const allUniqueExerciseIds = Array.from(new Set([...routineExerciseIds, ...exerciseIdsWithSets]));

    // Timer logic
    useEffect(() => {
        if (isFinishing) return;

        const timer = setInterval(() => {
            const start = new Date(session.startTime).getTime();
            const now = new Date().getTime();
            setElapsed(Math.floor((now - start) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [session.startTime, isFinishing]);

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
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                    onClick={handleFinish}
                    disabled={isFinishing}
                >
                    {isFinishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Finalizar
                </button>
            </header>

            <div className="space-y-6">
                {allUniqueExerciseIds.map((exerciseId) => {
                    const exercise = exerciseMap[exerciseId];
                    const exerciseSets = groupedSets[exerciseId] || [];
                    return (
                        <div key={exerciseId} className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                            <div className="p-4 bg-accent/5 border-b flex justify-between items-center">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Dumbbell className="h-4 w-4 text-brand-primary" />
                                    {exercise?.name || "Ejercicio"}
                                </h3>
                                <button
                                    onClick={() => addSet(exerciseId)}
                                    disabled={isAddingSet === exerciseId}
                                    className="text-xs font-bold uppercase text-brand-primary hover:bg-brand-primary/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                >
                                    {isAddingSet === exerciseId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                    Añadir Serie
                                </button>
                            </div>

                            <div className="p-0">
                                <table className="w-full text-center border-collapse">
                                    <thead>
                                        <tr className="text-[10px] font-bold uppercase text-muted-foreground border-b bg-muted/30">
                                            <th className="w-12 p-2">SET</th>
                                            <th className="p-2">PESO (KG)</th>
                                            <th className="p-2">REPS</th>
                                            <th className="w-12 p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exerciseSets.sort((a, b) => a.orderIndex - b.orderIndex).map((set, idx) => (
                                            <tr key={set.id} className="border-b last:border-0 hover:bg-accent/5 transition-colors">
                                                <td className="p-3 text-xs font-bold text-muted-foreground">{idx + 1}</td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        defaultValue={set.weight || ''}
                                                        onBlur={(e) => updateSetData(set.id, 'weight', e.target.value)}
                                                        className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        defaultValue={set.reps || ''}
                                                        onBlur={(e) => updateSetData(set.id, 'reps', e.target.value)}
                                                        className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <div className={`flex items-center justify-center h-8 w-8 rounded-full ${set.weight > 0 ? 'bg-brand-primary text-white shadow-sm' : 'bg-muted/50 text-muted-foreground'}`}>
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {/* Add more exercises button */}
                <button
                    className="w-full py-4 border-2 border-dashed rounded-2xl text-muted-foreground hover:text-brand-primary hover:border-brand-primary transition-all flex flex-col items-center justify-center gap-2"
                    onClick={() => {/* Open exercise selector */ }}
                >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-bold uppercase tracking-widest">Añadir Ejercicio</span>
                </button>
            </div>
        </div>
    );
}
