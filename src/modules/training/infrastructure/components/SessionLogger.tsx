'use client';

import { useState, useEffect } from 'react';
import { ExerciseSet } from '../../domain/Session';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Clock, Save, X, Loader2, Settings, Bell, BellOff, PlayCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/modules/training/presentation/contexts/SessionContext';

export function SessionLogger() {
    const router = useRouter();
    const {
        activeSession,
        sessionSets,
        completedSetIds,
        routine,
        exercises,
        preferredRestTime,
        updateSet,
        toggleSetCompletion,
        setPreferredRestTime,
        saveSession,
        finishSession,
        abandonSession,
        clearSession
    } = useSession();

    const [isFinishing, setIsFinishing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Custom Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelModalStage, setCancelModalStage] = useState<'abandon' | 'save'>('abandon');

    // Rest Timer States - Initialized with preferredRestTime from context
    const [restTime, setRestTime] = useState(preferredRestTime);
    const [isResting, setIsResting] = useState(false);
    const [internalTotalRestTime, setInternalTotalRestTime] = useState(preferredRestTime);
    const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [isRestFinished, setIsRestFinished] = useState(false);

    // Sync internal state when preferredRestTime changes
    useEffect(() => {
        setInternalTotalRestTime(preferredRestTime);
        setRestTime(preferredRestTime);
    }, [preferredRestTime]);

    if (!activeSession) return null;

    const allSetsCompleted = sessionSets.length > 0 && completedSetIds.length === sessionSets.length;

    // Group sets by exercise
    const groupedSets = sessionSets.reduce((acc, set) => {
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

    const handleToggleCompletion = (setId: string) => {
        toggleSetCompletion(setId);
        const wasCompleted = completedSetIds.includes(setId);
        if (!wasCompleted) {
            resetRestTimer();
        } else {
            stopRestTimer();
        }
    };

    const handleUpdateSet = (setId: string, field: 'weight' | 'reps', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        updateSet(setId, field, numValue);
    };

    const handleMainAction = async () => {
        if (allSetsCompleted) {
            handleSaveAndExit();
        } else {
            handleQuickSave();
        }
    };

    const handleSaveAndExit = async () => {
        if (isFinishing) return;
        setIsFinishing(true);
        try {
            await finishSession();
            router.replace('/dashboard');
        } catch (error) {
            alert("Error al finalizar: " + error);
        } finally {
            setIsFinishing(false);
        }
    };

    const handleQuickSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const result = await saveSession();
        if ('error' in result && result.error) {
            alert("Error al guardar: " + result.error);
        } else {
            // Visual feedback
            const btn = document.getElementById('main-action-btn');
            if (btn) {
                const originalBg = btn.style.backgroundColor;
                btn.style.backgroundColor = '#16a34a';
                setTimeout(() => {
                    btn.style.backgroundColor = originalBg;
                }, 1000);
            }
        }
        setIsSaving(false);
    };

    const handleCancel = async () => {
        if (isFinishing || isSaving) return;
        setCancelModalStage('abandon');
        setShowCancelModal(true);
    };

    const confirmAbandon = async () => {
        const hasFinishedSets = completedSetIds.length > 0;

        if (!hasFinishedSets) {
            setShowCancelModal(false);
            executeAbandon();
        } else {
            setCancelModalStage('save');
        }
    };

    const executeAbandon = async () => {
        setIsFinishing(true);
        try {
            await abandonSession();
            router.replace('/dashboard');
        } catch (error) {
            alert("Error al abandonar: " + error);
        } finally {
            setIsFinishing(false);
        }
    };

    const executeSaveAndExit = async () => {
        setIsFinishing(true);
        try {
            await finishSession();
            router.replace('/dashboard');
        } catch (error) {
            alert("Error al guardar y salir: " + error);
        } finally {
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
            oscillator.frequency.setValueAtTime(440, ctx.currentTime);

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
        setRestTime(internalTotalRestTime);
        setIsResting(true);
        setIsRestFinished(false);
    };

    const stopRestTimer = () => {
        setIsResting(false);
        setRestTime(internalTotalRestTime);
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
                                    value={Math.floor(internalTotalRestTime / 60)}
                                    onChange={(e) => {
                                        const sec = internalTotalRestTime % 60;
                                        const newTotal = parseInt(e.target.value || '0') * 60 + sec;
                                        setInternalTotalRestTime(newTotal);
                                        setPreferredRestTime(newTotal);
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
                                    value={internalTotalRestTime % 60}
                                    onChange={(e) => {
                                        const min = Math.floor(internalTotalRestTime / 60);
                                        const newTotal = min * 60 + parseInt(e.target.value || '0');
                                        setInternalTotalRestTime(newTotal);
                                        setPreferredRestTime(newTotal);
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
        <div className="space-y-6 pb-60">
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
                            {formatTime(isResting || isRestFinished ? restTime : internalTotalRestTime)}
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
                                <div className="grid grid-cols-4 text-[10px] font-bold uppercase text-muted-foreground border-b bg-muted/30 p-2">
                                    <div className="text-center">SET</div>
                                    <div className="text-center">PESO</div>
                                    <div className="text-center">REPS</div>
                                    <div className="text-center">ACCIÓN</div>
                                </div>
                                {exerciseSets.sort((a, b) => a.orderIndex - b.orderIndex).map((set, idx) => {
                                    const isCompleted = completedSetIds.includes(set.id);
                                    return (
                                        <div key={set.id} className="grid grid-cols-4 items-center border-b last:border-0 hover:bg-accent/5 transition-colors p-3 gap-2">
                                            <div className="text-center font-bold text-muted-foreground">{idx + 1}</div>
                                            <div className="flex justify-center">
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    value={set.weight}
                                                    onChange={(e) => handleUpdateSet(set.id, 'weight', e.target.value)}
                                                    className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <input
                                                    type="number"
                                                    value={set.reps}
                                                    onChange={(e) => handleUpdateSet(set.id, 'reps', e.target.value)}
                                                    className="w-16 h-10 bg-accent/20 rounded-lg text-center font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleToggleCompletion(set.id)}
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
                    );
                })}
            </div>

            {/* Floating Action Button Group */}
            <div className="fixed bottom-24 left-6 right-6 z-50 flex items-center justify-between gap-3 pointer-events-none">
                <div className="flex w-full items-center justify-between pointer-events-auto">
                    {/* Cancel Button - Left */}
                    <button
                        onClick={handleCancel}
                        disabled={isFinishing || isSaving}
                        className="flex items-center gap-2 rounded-2xl px-4 py-4 text-xs font-black text-white bg-red-600/90 shadow-2xl transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 border border-red-400 shadow-red-900/40"
                    >
                        <div className="flex items-center justify-center rounded-lg p-1 bg-white/20">
                            <X className="h-4 w-4" />
                        </div>
                        <span className="tracking-tight uppercase font-black">
                            CANCELAR
                        </span>
                    </button>

                    {/* Main Dynamic Action Button - Right */}
                    <button
                        id="main-action-btn"
                        onClick={handleMainAction}
                        disabled={isFinishing || isSaving}
                        className={`flex items-center gap-2 rounded-2xl px-4 py-4 text-xs font-black text-white shadow-2xl transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 ${allSetsCompleted ? 'bg-brand-primary shadow-brand-primary/30' : 'bg-zinc-900 border border-zinc-800 shadow-black/50'}`}
                    >
                        {isFinishing || isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className={`flex items-center justify-center rounded-lg p-1 ${allSetsCompleted ? 'bg-white/20' : 'bg-brand-primary/20 text-brand-primary'}`}>
                                {allSetsCompleted ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            </div>
                        )}
                        <span className="tracking-tight uppercase font-black">
                            {allSetsCompleted ? "GUARDAR" : "GUARDAR"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Custom Cancellation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        {cancelModalStage === 'abandon' ? (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-red-600/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <X className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">¿Abandonar entrenamiento?</h3>
                                    <p className="text-zinc-400 font-medium">Se perderá el progreso de esta sesión si no ha sido guardado.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all uppercase text-sm"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={confirmAbandon}
                                        className="py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all uppercase text-sm"
                                    >
                                        Sí
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Save className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Sesión con progreso</h3>
                                    <p className="text-zinc-400 font-medium font-semibold">Tienes series terminadas. ¿Qué quieres hacer?</p>
                                </div>
                                <div className="flex flex-col gap-3 mt-8">
                                    <button
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            executeSaveAndExit();
                                        }}
                                        className="w-full py-4 bg-brand-primary text-white font-black rounded-2xl transition-all uppercase text-sm shadow-lg shadow-brand-primary/20"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            executeAbandon();
                                        }}
                                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all uppercase text-sm"
                                    >
                                        No Guardar
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-3 text-zinc-500 hover:text-white font-bold transition-all uppercase text-xs mt-2"
                                    >
                                        Volver
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
