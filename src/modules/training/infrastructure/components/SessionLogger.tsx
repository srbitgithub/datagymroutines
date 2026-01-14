'use client';

import { useState, useEffect } from 'react';
import { ExerciseSet } from '../../domain/Session';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Clock, X, Save, Settings, Bell, BellOff, Loader2, Check, Info } from 'lucide-react';
import { CustomDialog } from '@/components/ui/CustomDialog';
import { useRouter } from 'next/navigation';
import { useSession } from '@/modules/training/presentation/contexts/SessionContext';
import { useTranslation } from '@/core/i18n/TranslationContext';

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
    const { t } = useTranslation();

    const [isFinishing, setIsFinishing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Custom Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelModalStage, setCancelModalStage] = useState<'abandon' | 'save'>('abandon');
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

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
            alert(t('training.error_finishing') + ": " + error);
        } finally {
            setIsFinishing(false);
        }
    };

    const handleQuickSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const result = await saveSession();
        if ('error' in result && result.error) {
            alert(t('training.error_saving') + ": " + result.error);
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
        } catch (error: any) {
            setErrorDialog({ isOpen: true, message: error.message || "Error al abandonar" });
        } finally {
            setIsFinishing(false);
        }
    };

    const executeSaveAndExit = async () => {
        setIsFinishing(true);
        try {
            await finishSession();
            router.replace('/dashboard');
        } catch (error: any) {
            setErrorDialog({ isOpen: true, message: error.message || t('training.error_saving') });
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
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{t('training.rest_settings')}</h3>
                    <button
                        onClick={() => setShowConfig(false)}
                        className="p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto py-10 space-y-10 flex flex-col justify-center max-w-lg mx-auto w-full">
                    <section className="space-y-6">
                        <label className="text-xs font-bold uppercase text-zinc-500 tracking-widest text-center block">{t('training.rest_time_hint')}</label>
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
                                <p className="text-xs font-bold text-zinc-500 mt-2">{t('training.minutes')}</p>
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
                                <p className="text-xs font-bold text-zinc-500 mt-2">{t('training.seconds')}</p>
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
                            {t('training.back_to_training')}
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
                            {isRestFinished ? t('training.rest_finished') : isResting ? t('training.resting') : t('training.ready')}
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
                                    {exercise?.name || t('common.global')}
                                </h3>
                            </div>

                            <div className="p-0">
                                <div className="grid grid-cols-4 text-[10px] font-bold uppercase text-muted-foreground border-b bg-muted/30 p-2">
                                    <div className="text-center">{t('training.set')}</div>
                                    <div className="text-center">{t('training.weight')}</div>
                                    <div className="text-center">{t('training.reps')}</div>
                                    <div className="text-center">{t('training.action')}</div>
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
                                                    {isCompleted ? t('training.done') : t('training.finish')}
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
                            {t('common.cancel')}
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
                            {allSetsCompleted ? t('training.finish_session') : t('common.save')}
                        </span>
                    </button>
                </div>
            </div>

            {/* Reusable CustomDialogs */}
            <CustomDialog
                isOpen={showCancelModal && cancelModalStage === 'abandon'}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmAbandon}
                title={t('training.abandon_title')}
                description={t('training.abandon_desc')}
                variant="danger"
                type="confirm"
                confirmLabel={t('common.yes')}
                cancelLabel={t('common.no')}
            />

            <CustomDialog
                isOpen={showCancelModal && cancelModalStage === 'save'}
                onClose={() => setShowCancelModal(false)}
                onConfirm={executeSaveAndExit}
                title={t('training.session_with_progress')}
                description={t('training.session_with_progress_desc')}
                type="confirm"
                confirmLabel={t('training.save_confirm')}
                cancelLabel={t('training.no_save_confirm')}
            />

            {/* Special case for "Volver" in the save stage - if needed we can add a 3rd button to CustomDialog or keep it simple */}
            {/* For now, I'll stick to the confirm labels requested. "cancel" will be "No Guardar" */}

            <CustomDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                title="Error"
                description={errorDialog.message}
                variant="danger"
                type="alert"
            />
        </div>
    );
}
