'use client';

import { Routine } from '../../domain/Routine';
import { Exercise } from '../../domain/Exercise';
import { useSession } from '../contexts/SessionContext';
import { ListChecks, Play, AlertCircle, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { CustomDialog } from '@/components/ui/CustomDialog';
import { useTranslation } from '@/core/i18n/TranslationContext';

interface RoutineSelectionProps {
    routines: Routine[];
    exercises: Exercise[];
}

export function RoutineSelection({ routines, exercises }: RoutineSelectionProps) {
    const { startNewSession, isLoading } = useSession();
    const [startingId, setStartingId] = useState<string | null>(null);
    const { t } = useTranslation();
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });

    const handleStart = async (routine: Routine) => {
        setStartingId(routine.id);
        try {
            await startNewSession(routine, exercises);
        } catch (error: any) {
            setErrorDialog({
                isOpen: true,
                message: error.message || t('training.error_starting')
            });
        } finally {
            setStartingId(null);
        }
    };

    if (routines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4 rounded-2xl border-2 border-dashed border-brand-primary/20 bg-brand-primary/5">
                <div className="bg-brand-primary/10 p-6 rounded-full mb-6 relative">
                    <Dumbbell className="h-10 w-10 text-brand-primary absolute inset-0 m-auto" />
                    <Play className="h-5 w-5 fill-current text-white absolute bottom-2 right-2 rounded-full bg-brand-primary p-1 shadow-md" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{t('training.no_routines', { defaultValue: '¡Aún no hay rutinas!' })}</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                    {t('training.create_routine_cta', { defaultValue: 'Crea tu primera rutina para empezar a registrar tus entrenamientos y ver tu evolución.' })}
                </p>
                <Link
                    href="/dashboard/routines/new"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-primary px-8 font-black text-white uppercase tracking-widest shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 hover:bg-brand-primary/90 active:scale-95"
                >
                    {t('training.create_first_routine', { defaultValue: 'Crear mi primera rutina' })}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-black uppercase tracking-tight">{t('training.choose_routine')}</h2>
                <p className="text-muted-foreground">{t('training.start_subtitle')}</p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
                {routines.map((routine) => (
                    <button
                        key={routine.id}
                        disabled={isLoading}
                        onClick={() => handleStart(routine)}
                        className="group relative flex flex-col text-left rounded-2xl border bg-card p-6 shadow-sm hover:border-brand-primary active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="rounded-full bg-brand-primary/10 p-3 group-hover:bg-brand-primary/20 transition-colors">
                                <ListChecks className="h-6 w-6 text-brand-primary" />
                            </div>
                            <div className="flex items-center gap-1 bg-brand-primary/5 px-2 py-1 rounded-full">
                                <span className="text-[10px] font-black text-brand-primary uppercase">{t('training.exercises_count', { count: routine.exercises.length })}</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-black group-hover:text-brand-primary transition-colors">{routine.name}</h3>
                        {routine.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{routine.description}</p>
                        )}
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('training.start_now')}</span>
                            <div className="bg-brand-primary p-2 rounded-lg text-white shadow-lg shadow-brand-primary/20">
                                {startingId === routine.id ? (
                                    <span className="block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Play className="h-5 w-5 fill-current" />
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <CustomDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                title={t('training.error_starting')}
                description={errorDialog.message}
                type="alert"
                variant="danger"
            />
        </div>
    );
}
