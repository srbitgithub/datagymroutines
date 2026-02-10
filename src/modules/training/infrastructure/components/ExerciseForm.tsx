'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { createExerciseAction } from '@/app/_actions/training';
import { Plus, Loader2 } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function ExerciseForm({ onSuccess }: { onSuccess?: () => void }) {
    const [state, action, isPending] = useActionState(createExerciseAction, null);
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('Pecho');
    const [loggingType, setLoggingType] = useState('strength');
    const { t } = useTranslation();

    const onSuccessRef = useRef(onSuccess);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        if (state?.success) {
            setName('');
            if (onSuccessRef.current) onSuccessRef.current();
        }
    }, [state]);

    return (
        <form action={action} className="grid gap-4 md:grid-cols-[2fr_1fr_1.5fr_auto] items-end">
            <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">{t('exercises.name_label')}</label>
                <input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('exercises.name_placeholder')}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="muscleGroup" className="text-xs font-bold uppercase text-muted-foreground">{t('exercises.group_label')}</label>
                <select
                    id="muscleGroup"
                    name="muscleGroup"
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-zinc-900 dark:text-white"
                >
                    <option value="Pecho">{t('exercises.muscle_groups.Pecho')}</option>
                    <option value="Espalda">{t('exercises.muscle_groups.Espalda')}</option>
                    <option value="Piernas">{t('exercises.muscle_groups.Piernas')}</option>
                    <option value="Hombros">{t('exercises.muscle_groups.Hombros')}</option>
                    <option value="Antebrazos">{t('exercises.muscle_groups.Antebrazos')}</option>
                    <option value="Bíceps">{t('exercises.muscle_groups.Bíceps')}</option>
                    <option value="Tríceps">{t('exercises.muscle_groups.Tríceps')}</option>
                    <option value="Core">{t('exercises.muscle_groups.Core')}</option>
                    <option value="Otros">{t('exercises.muscle_groups.Otros')}</option>
                </select>
            </div>

            <div className="space-y-2">
                <label htmlFor="loggingType" className="text-xs font-bold uppercase text-muted-foreground">{t('exercises.logging_type_label')}</label>
                <select
                    id="loggingType"
                    name="loggingType"
                    value={loggingType}
                    onChange={(e) => setLoggingType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-zinc-900 dark:text-white font-medium"
                >
                    <option value="strength">{t('exercises.logging_types.strength')}</option>
                    <option value="time">{t('exercises.logging_types.time')}</option>
                    <option value="bodyweight">{t('exercises.logging_types.bodyweight')}</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-6 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.add')}
            </button>

            {state?.error && (
                <p className="text-xs text-red-500 col-span-full">{state.error}</p>
            )}
            {state?.success && (
                <p className="text-xs text-green-500 col-span-full">{t('exercises.add_success')}</p>
            )}
        </form>
    );
}
