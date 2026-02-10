'use client';

import { useState } from 'react';
import { createRoutineAction, updateRoutineAction } from '@/app/_actions/training';
import { Exercise } from '../../domain/Exercise';
import { Routine } from '../../domain/Routine';
import { Plus, GripVertical, Trash2, Save, Dumbbell, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomDialog } from '@/components/ui/CustomDialog';
import { useTranslation } from '@/core/i18n/TranslationContext';

interface ExerciseConfig {
    exercise: Exercise;
    series: number;
    targetReps: number;
    targetWeight: number;
}

interface RoutineBuilderFormProps {
    exercises: Exercise[];
    initialRoutine?: Routine;
}

export function RoutineBuilderForm({ exercises, initialRoutine }: RoutineBuilderFormProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [name, setName] = useState(initialRoutine?.name || '');
    const [description, setDescription] = useState(initialRoutine?.description || '');
    const [selectedExercises, setSelectedExercises] = useState<ExerciseConfig[]>(() => {
        if (initialRoutine) {
            return initialRoutine.exercises.map(re => ({
                exercise: re.exercise!,
                series: re.series,
                targetReps: re.targetReps || 12,
                targetWeight: re.targetWeight || 0
            }));
        }
        return [];
    });
    const [isSaving, setIsSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });

    const userExercises = exercises.filter(e => !e.id.startsWith('default-'));
    const appExercises = exercises.filter(e => e.id.startsWith('default-'));

    const categories = ['Todos', ...Array.from(new Set(exercises.map(e => e.muscleGroup)))].sort();

    const filteredUserExercises = selectedCategory === 'Todos'
        ? userExercises
        : userExercises.filter(e => e.muscleGroup === selectedCategory);

    const filteredAppExercises = selectedCategory === 'Todos'
        ? appExercises
        : appExercises.filter(e => e.muscleGroup === selectedCategory);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);

        // Auto-scroll logic
        const threshold = 100; // pixels from edge
        const scrollSpeed = 15;
        const { clientY } = e;
        const viewportHeight = window.innerHeight;

        if (clientY < threshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (clientY > viewportHeight - threshold) {
            window.scrollBy(0, scrollSpeed);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const newItems = [...selectedExercises];
        const [movedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);

        setSelectedExercises(newItems);
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };


    const addExercise = (exercise: Exercise) => {
        setSelectedExercises([...selectedExercises, {
            exercise,
            series: 3,
            targetReps: 12,
            targetWeight: 0
        }]);
    };

    const updateConfig = (index: number, field: keyof Omit<ExerciseConfig, 'exercise'>, value: number) => {
        setSelectedExercises(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const removeExercise = (index: number) => {
        setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || selectedExercises.length === 0) return;

        setIsSaving(true);
        const exercisesData = selectedExercises.map((item) => ({
            id: item.exercise.id,
            series: item.series,
            targetReps: item.targetReps,
            targetWeight: item.targetWeight
        }));

        const result = initialRoutine
            ? await updateRoutineAction(initialRoutine.id, name, description, exercisesData)
            : await createRoutineAction(name, description, exercisesData);

        setIsSaving(false);
        if (result.success) {
            router.push('/dashboard/routines');
            router.refresh();
        } else {
            setErrorDialog({
                isOpen: true,
                message: result.error || t('common.error')
            });
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-32">
            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-2">
                    <label htmlFor="routine-name" className="text-sm font-bold uppercase text-muted-foreground">{t('routines.name_label')}</label>
                    <input
                        id="routine-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={t('routines.name_placeholder')}
                        className="flex h-12 w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary placeholder:text-muted-foreground"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="routine-desc" className="text-sm font-bold uppercase text-muted-foreground">{t('routines.desc_label')}</label>
                    <textarea
                        id="routine-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder={t('routines.desc_placeholder')}
                        className="flex h-12 w-full rounded-md border border-border bg-muted/50 px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('routines.exercises_title')}</h2>
                {selectedExercises.length > 0 ? (
                    <div className="space-y-4">
                        {selectedExercises.map((item, index) => (
                            <div
                                key={`${item.exercise.id}-${index}`}
                                className="relative"
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                {dropTargetIndex === index && draggedIndex !== index && (
                                    <div className="absolute -top-2 left-0 right-0 h-1 bg-yellow-400 rounded-full z-10 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                )}

                                <div
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnd={handleDragEnd}
                                    className={`block rounded-xl border bg-card shadow-sm animate-in fade-in slide-in-from-left-2 duration-200 transition-opacity ${draggedIndex === index ? 'opacity-40' : ''}`}
                                >
                                    <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate text-sm">{item.exercise.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">
                                                {t(`exercises.muscle_groups.${item.exercise.muscleGroup}`) || item.exercise.muscleGroup}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeExercise(index)}
                                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="p-4 grid grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Series</label>
                                            <input
                                                type="number"
                                                value={item.series}
                                                onChange={(e) => updateConfig(index, 'series', parseInt(e.target.value || '0'))}
                                                className="w-full h-10 bg-muted/50 border border-border rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">
                                                {item.exercise.loggingType === 'time' ? t('training.time') : t('training.reps')}
                                            </label>
                                            {item.exercise.loggingType === 'time' ? (
                                                <div className="flex items-center gap-1 h-10 px-2 bg-muted/50 border border-border rounded-lg justify-center transition-all focus-within:ring-1 focus-within:ring-brand-primary">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={Math.floor(item.targetReps / 60)}
                                                        onChange={(e) => {
                                                            const mins = parseInt(e.target.value || '0');
                                                            const secs = item.targetReps % 60;
                                                            updateConfig(index, 'targetReps', mins * 60 + secs);
                                                        }}
                                                        className="w-7 bg-transparent text-right font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <span className="text-muted-foreground font-bold">:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="59"
                                                        value={item.targetReps % 60}
                                                        onChange={(e) => {
                                                            const mins = Math.floor(item.targetReps / 60);
                                                            const secs = parseInt(e.target.value || '0');
                                                            updateConfig(index, 'targetReps', mins * 60 + (secs > 59 ? 59 : secs));
                                                        }}
                                                        className="w-7 bg-transparent text-left font-bold text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={item.targetReps}
                                                    onChange={(e) => updateConfig(index, 'targetReps', parseInt(e.target.value || '0'))}
                                                    className="w-full h-10 bg-muted/50 border border-border rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">
                                                {item.exercise.loggingType === 'bodyweight' ? 'Lastre (kg)' : `${t('training.weight')} (kg)`}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={item.targetWeight}
                                                onChange={(e) => updateConfig(index, 'targetWeight', parseFloat(e.target.value || '0'))}
                                                className="w-full h-10 bg-muted/50 border border-border rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {dropTargetIndex === index + 1 && draggedIndex !== index && index === selectedExercises.length - 1 && (
                                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded-full z-10 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center opacity-60">
                        <Dumbbell className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground px-4">{t('routines.select_exercises_hint')}</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t('routines.catalog_title')}</h2>
                    <div className="space-y-1.5 min-w-[160px]">
                        <label htmlFor="category-filter" className="text-[10px] font-bold uppercase text-muted-foreground px-1">{t('routines.filter_group')}</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-border bg-muted/50 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary text-foreground"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'Todos' ? t('common.all') : (t(`exercises.muscle_groups.${cat}`) || cat)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[350px] border rounded-xl p-3 bg-accent/5 shadow-inner">
                    {(filteredUserExercises.length > 0 || filteredAppExercises.length > 0) ? (
                        <>
                            {filteredUserExercises.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 bg-muted/20 rounded-md">
                                        {t('exercises.my_exercises') || 'Mis Ejercicios'}
                                    </h3>
                                    {filteredUserExercises.map((exercise) => (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            onClick={() => addExercise(exercise)}
                                            className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:border-brand-primary/50 hover:shadow-md transition-all active:scale-[0.98] animate-in fade-in duration-200"
                                        >
                                            <div>
                                                <p className="text-sm font-bold">{exercise.name}</p>
                                                <p className="text-[10px] uppercase font-medium text-muted-foreground">
                                                    {t(`exercises.muscle_groups.${exercise.muscleGroup}`) || exercise.muscleGroup}
                                                </p>
                                            </div>
                                            <div className="bg-brand-primary/10 p-2 rounded-lg">
                                                <Plus className="h-4 w-4 text-brand-primary" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredAppExercises.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1 bg-muted/20 rounded-md">
                                        {t('exercises.app_exercises') || 'De la Aplicación'}
                                    </h3>
                                    {filteredAppExercises.map((exercise) => (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            onClick={() => addExercise(exercise)}
                                            className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left hover:border-brand-primary/50 hover:shadow-md transition-all active:scale-[0.98] animate-in fade-in duration-200"
                                        >
                                            <div>
                                                <p className="text-sm font-bold">{exercise.name}</p>
                                                <p className="text-[10px] uppercase font-medium text-muted-foreground">
                                                    {t(`exercises.muscle_groups.${exercise.muscleGroup}`) || exercise.muscleGroup}
                                                </p>
                                            </div>
                                            <div className="bg-brand-primary/10 p-2 rounded-lg">
                                                <Plus className="h-4 w-4 text-brand-primary" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground text-xs italic">
                            {t('routines.no_exercises_category')}
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t md:relative md:bg-transparent md:border-t-0 md:p-0 md:mt-10 z-50">
                <div className="max-w-2xl mx-auto px-2">
                    <button
                        type="submit"
                        disabled={isSaving || !name || selectedExercises.length === 0}
                        className="flex h-16 w-full items-center justify-center rounded-2xl bg-brand-primary text-xl font-black text-white shadow-2xl shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 disabled:opacity-50 active:scale-95 uppercase tracking-tight"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>{initialRoutine ? t('routines.updating') : t('routines.creating')}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-6 w-6" />
                                <span>{initialRoutine ? t('routines.update_routine') : t('routines.save_routine')}</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            <CustomDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                title="Error al guardar"
                description={errorDialog.message}
                type="alert"
                variant="danger"
            />
        </form>
    );
}
