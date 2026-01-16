'use client';

import { useState, useEffect, useCallback } from "react";
import { getExercisesAction } from "@/app/_actions/training";
import { ExerciseForm } from "@/modules/training/infrastructure/components/ExerciseForm";
import { ExerciseListItem } from "@/modules/training/infrastructure/components/ExerciseListItem";
import { Dumbbell, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/core/i18n/TranslationContext";
import { Exercise } from "@/modules/training/domain/Exercise";

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    const refreshExercises = useCallback(async () => {
        const data = await getExercisesAction();
        setExercises(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshExercises();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    // Agrupar por grupo muscular
    const groups = exercises.reduce((acc, exercise) => {
        const group = exercise.muscleGroup || 'Otros';
        if (!acc[group]) acc[group] = [];
        acc[group].push(exercise);
        return acc;
    }, {} as Record<string, typeof exercises>);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">{t('exercises.title')}</h1>
                    <p className="text-muted-foreground font-medium">
                        {t('exercises.subtitle')}
                    </p>
                </div>
            </header>

            <div className="rounded-3xl border bg-zinc-900/30 p-8 shadow-sm backdrop-blur-sm">
                <h2 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                    <div className="bg-brand-primary/20 p-1.5 rounded-lg">
                        <Plus className="h-4 w-4 text-brand-primary" />
                    </div>
                    {t('exercises.new_exercise')}
                </h2>
                <ExerciseForm onSuccess={refreshExercises} />
            </div>

            <div className="space-y-12">
                {Object.entries(groups).sort().map(([group, groupExercises]) => (
                    <section key={group} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                                {t(`exercises.muscle_groups.${group}`) || group}
                            </h3>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {groupExercises.map((exercise) => (
                                <ExerciseListItem
                                    key={exercise.id}
                                    exercise={exercise}
                                    onRefresh={refreshExercises}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
