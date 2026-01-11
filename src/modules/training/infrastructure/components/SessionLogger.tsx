'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, ExerciseSet } from '../../domain/Session';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Plus, Check, Clock, Save, X, Trash2, Loader2, Settings, Bell, BellOff, RefreshCw } from 'lucide-react';
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

    // Rest Timer States
    const [restTime, setRestTime] = useState(120); // Current countdown
    const [isResting, setIsResting] = useState(false);
    const [totalRestTime, setTotalRestTime] = useState(120); // Configured time
    const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [isRestFinished, setIsRestFinished] = useState(false);

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

            // Start rest timer automatically
            setRestTime(totalRestTime);
            setIsResting(true);
            setIsRestFinished(false);

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

    // Rest Timer logic
    useEffect(() => {
        if (!isResting || isFinishing) return;

        const timer = setInterval(() => {
            setRestTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsResting(false);
                    setIsRestFinished(true);
                    if (isAlarmEnabled) {
                        playAlarm();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isResting, isFinishing, isAlarmEnabled]);

    const playAlarm = () => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 1);
        } catch (e) {
            console.error('Error playing alarm:', e);
        }
    };

    const resetRestTimer = () => {
        setRestTime(totalRestTime);
        setIsResting(true);
        setIsRestFinished(false);
    };

    const stopRestTimer = () => {
        setIsResting(false);
        setRestTime(totalRestTime);
        setIsRestFinished(false);
    };

    return (
        <div className="space-y-6 pb-40">
            <header className={`sticky top-0 z-30 flex items-center justify-between border-b p-4 -mx-6 md:mx-0 md:rounded-xl md:border mb-6 transition-all duration-500 backdrop-blur-md ${isRestFinished ? 'bg-red-600/90 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] border-red-400' : isResting ? 'bg-brand-primary/90 text-white shadow-lg' : 'bg-background/80'}`}>
                <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${isResting || isRestFinished ? 'bg-white/20' : 'bg-brand-primary/10'}`}>
                        <Clock className={`h-5 w-5 ${isResting || isRestFinished ? 'text-white' : 'text-brand-primary'}`} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-bold uppercase ${isResting || isRestFinished ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {isRestFinished ? '¡DESCANSO TERMINADO!' : isResting ? 'DESCANSANDO...' : 'PREPARADO'}
                        </p>
                        <p className="text-3xl font-black tabular-nums tracking-tight">
                            {formatTime(isResting || isRestFinished ? restTime : totalRestTime)}
                        </p>
                    </div>
                    {isResting && (
                        <button
                            onClick={stopRestTimer}
                            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    )}
                    {isRestFinished && (
                        <button
                            onClick={() => setIsRestFinished(false)}
                            className="px-3 py-1 rounded-full bg-white text-red-600 text-[10px] font-black uppercase shadow-sm"
                        >
                            OK
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={`p-2 rounded-lg transition-colors ${isResting || isRestFinished ? 'hover:bg-white/20 text-white' : 'hover:bg-accent text-muted-foreground'}`}
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                    <button
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-green-600 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        onClick={handleFinish}
                        disabled={isFinishing}
                    >
                        {isFinishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Finalizar
                    </button>
                </div>

                {showConfig && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-background border rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 text-foreground">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-sm uppercase tracking-wider">Ajustes de Descanso</h4>
                            <button onClick={() => setShowConfig(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Tiempo de descanso</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={Math.floor(totalRestTime / 60)}
                                        onChange={(e) => {
                                            const sec = totalRestTime % 60;
                                            setTotalRestTime(parseInt(e.target.value || '0') * 60 + sec);
                                        }}
                                        className="w-12 h-8 bg-accent/20 rounded text-center font-bold outline-none"
                                    />
                                    <span>:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={totalRestTime % 60}
                                        onChange={(e) => {
                                            const min = Math.floor(totalRestTime / 60);
                                            setTotalRestTime(min * 60 + parseInt(e.target.value || '0'));
                                        }}
                                        className="w-12 h-8 bg-accent/20 rounded text-center font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Alarma sonora</span>
                                <button
                                    onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
                                    className={`p-2 rounded-lg transition-colors ${isAlarmEnabled ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {isAlarmEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
