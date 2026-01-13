'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrainingSession, ExerciseSet } from '../../domain/Session';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Plus, Check, Clock, Save, X, Trash2, Loader2, Settings, Bell, BellOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { finishSessionAction, saveSessionBatchAction } from '@/app/_actions/training';

import { Routine } from '../../domain/Routine';

interface SessionLoggerProps {
    session: TrainingSession;
    exercises: Exercise[];
    routine: Routine | null;
}

export function SessionLogger({ session, exercises, routine }: SessionLoggerProps) {
    const router = useRouter();

    // Initialize sets either from current session or pre-fill from routine if session is empty
    const [sets, setSets] = useState<ExerciseSet[]>(() => {
        if (session.sets && session.sets.length > 0) {
            return session.sets;
        }

        if (routine) {
            const prefilledSets: ExerciseSet[] = [];
            routine.exercises.forEach((re) => {
                for (let i = 0; i < re.series; i++) {
                    prefilledSets.push({
                        id: crypto.randomUUID(),
                        sessionId: session.id,
                        exerciseId: re.exerciseId,
                        weight: re.targetWeight || 0,
                        reps: re.targetReps || 0,
                        type: 'normal',
                        orderIndex: i,
                        createdAt: new Date()
                    });
                }
            });
            return prefilledSets;
        }

        return [];
    });

    const [completedSetIds, setCompletedSetIds] = useState<Set<string>>(new Set());
    const [isFinishing, setIsFinishing] = useState(false);

    // Rest Timer States
    const [restTime, setRestTime] = useState(120); // Current countdown
    const [isResting, setIsResting] = useState(false);
    const [totalRestTime, setTotalRestTime] = useState(120); // Configured time
    const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [isRestFinished, setIsRestFinished] = useState(false);

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

    const toggleSetCompletion = (setId: string) => {
        setCompletedSetIds(prev => {
            const next = new Set(prev);
            if (next.has(setId)) {
                next.delete(setId);
                // Stop timer if we un-complete
                stopRestTimer();
            } else {
                next.add(setId);
                // Start timer
                resetRestTimer();
            }
            return next;
        });
    };

    const updateSetData = (setId: string, field: 'weight' | 'reps', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setSets(prev => prev.map(s => s.id === setId ? { ...s, [field]: numValue } : s));
    };

    const handleFinish = async () => {
        if (isFinishing) return;
        setIsFinishing(true);

        // Final save: send all current sets to DB
        const result = await saveSessionBatchAction(session.id, sets);

        if (result.success) {
            router.replace('/dashboard');
            router.refresh();
        } else {
            alert("Error al guardar: " + result.error);
            setIsFinishing(false);
        }
    };

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

    const exerciseMap = exercises.reduce((acc, ex) => {
        acc[ex.id] = ex;
        return acc;
    }, {} as Record<string, Exercise>);

    const routineExerciseIds = routine?.exercises.map((re: any) => re.exerciseId) || [];
    const exerciseIdsWithSets = Object.keys(groupedSets);
    const allUniqueExerciseIds = Array.from(new Set([...routineExerciseIds, ...exerciseIdsWithSets]));

    if (showConfig) {
        return (
            <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col pt-safe px-4">
                <header className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900 -mx-4">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Ajustes de Descanso</h3>
                    <button
                        onClick={() => setShowConfig(false)}
                        className="p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto py-10 space-y-10 flex flex-col justify-center max-w-lg mx-auto w-full">
                    <section className="space-y-6">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-widest text-center block">Tiempo de descanso entre series</label>
                        <div className="flex items-center justify-center gap-6 bg-zinc-900/50 p-10 rounded-3xl border border-zinc-800 shadow-inner">
                            <div className="text-center">
                                <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={Math.floor(totalRestTime / 60)}
                                    onChange={(e) => {
                                        const sec = totalRestTime % 60;
                                        setTotalRestTime(parseInt(e.target.value || '0') * 60 + sec);
                                    }}
                                    className="w-24 text-6xl font-black bg-transparent text-center outline-none focus:text-brand-primary text-white"
                                />
                                <p className="text-xs font-bold text-zinc-500 mt-2">MINUTOS</p>
                            </div>
                            <div className="text-5xl font-black text-zinc-800 self-start mt-2">:</div>
                            <div className="text-center">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={totalRestTime % 60}
                                    onChange={(e) => {
                                        const min = Math.floor(totalRestTime / 60);
                                        setTotalRestTime(min * 60 + parseInt(e.target.value || '0'));
                                    }}
                                    className="w-24 text-6xl font-black bg-transparent text-center outline-none focus:text-brand-primary text-white"
                                />
                                <p className="text-xs font-bold text-zinc-500 mt-2">SEGUNDOS</p>
                            </div>
                        </div>
                    </section>

                    <section className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isAlarmEnabled ? 'bg-brand-primary/20 text-brand-primary' : 'bg-zinc-800 text-zinc-600'}`}>
                                {isAlarmEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
                            </div>
                            <div>
                                <p className="font-black text-lg text-white">Alarma Sonora</p>
                                <p className="text-sm text-zinc-500 font-medium">Emitir sonido al terminar</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
                            className={`w-16 h-8 rounded-full transition-all relative ${isAlarmEnabled ? 'bg-brand-primary' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${isAlarmEnabled ? 'left-9' : 'left-1'}`} />
                        </button>
                    </section>

                    <section className="pt-6 space-y-4">
                        <button
                            onClick={() => setShowConfig(false)}
                            className="w-full py-6 bg-white text-zinc-950 font-black text-xl rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-tight"
                        >
                            Volver al entrenamiento
                        </button>
                    </section>
                </main>
            </div>
        );
    }

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
                        className={`inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isFinishing ? 'bg-zinc-800' : 'bg-green-600 hover:bg-green-500'}`}
                        onClick={handleFinish}
                        disabled={isFinishing}
                    >
                        {isFinishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        GUARDAR
                    </button>
                </div>
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
                            </div>

                            <div className="p-0">
                                <div className="space-y-0 text-sm">
                                    <div className="grid grid-cols-4 text-[10px] font-bold uppercase text-muted-foreground border-b bg-muted/30 p-2">
                                        <div className="text-center">SET</div>
                                        <div className="text-center">PESO</div>
                                        <div className="text-center">REPS</div>
                                        <div className="text-center">ACCIÓN</div>
                                    </div>
                                    {exerciseSets.sort((a, b) => a.orderIndex - b.orderIndex).map((set, idx) => {
                                        const isCompleted = completedSetIds.has(set.id);
                                        return (
                                            <div key={set.id} className="grid grid-cols-4 items-center border-b last:border-0 hover:bg-accent/5 transition-colors p-3 gap-2">
                                                <div className="text-center font-bold text-muted-foreground">{idx + 1}</div>
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={set.weight}
                                                        onChange={(e) => updateSetData(set.id, 'weight', e.target.value)}
                                                        className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        value={set.reps}
                                                        onChange={(e) => updateSetData(set.id, 'reps', e.target.value)}
                                                        className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => toggleSetCompletion(set.id)}
                                                        className={`h-10 w-full rounded-lg text-[10px] font-black uppercase transition-all duration-300 shadow-sm active:scale-95 ${isCompleted ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                                                    >
                                                        {isCompleted ? 'TERMINADA' : 'FINALIZAR'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
