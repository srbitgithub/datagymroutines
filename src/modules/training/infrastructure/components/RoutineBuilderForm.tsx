'use client';

import { useState } from 'react';
import { createRoutineAction, updateRoutineAction } from '@/app/_actions/training';
import { Exercise } from '../../domain/Exercise';
import { Routine } from '../../domain/Routine';
import { Plus, GripVertical, Trash2, Save, Dumbbell, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomDialog } from '@/components/ui/CustomDialog';

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

    const categories = ['Todos', ...Array.from(new Set(exercises.map(e => e.muscleGroup)))].sort();

    const filteredExercises = selectedCategory === 'Todos'
        ? exercises
        : exercises.filter(e => e.muscleGroup === selectedCategory);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);
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
                message: result.error || "Ocurrió un error al guardar la rutina."
            });
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-32">
            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-2">
                    <label htmlFor="routine-name" className="text-sm font-bold uppercase text-muted-foreground">Nombre de la Rutina</label>
                    <input
                        id="routine-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Ej: Torso - Potencia"
                        className="flex h-12 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="routine-desc" className="text-sm font-bold uppercase text-muted-foreground">Descripción (opcional)</label>
                    <textarea
                        id="routine-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        placeholder="Ej: Enfocada en básicos y progresión de cargas..."
                        className="flex h-12 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ejercicios y Series</h2>
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
                                            <p className="text-[10px] text-muted-foreground uppercase">{item.exercise.muscleGroup}</p>
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
                                                className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Reps</label>
                                            <input
                                                type="number"
                                                value={item.targetReps}
                                                onChange={(e) => updateConfig(index, 'targetReps', parseInt(e.target.value || '0'))}
                                                className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-muted-foreground block text-center">Peso (kg)</label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={item.targetWeight}
                                                onChange={(e) => updateConfig(index, 'targetWeight', parseFloat(e.target.value || '0'))}
                                                className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-lg text-center font-bold text-sm focus:ring-1 focus:ring-brand-primary outline-none"
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
                        <p className="text-xs text-muted-foreground px-4">Selecciona ejercicios de la lista para configurar tus series.</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Catálogo de Ejercicios</h2>
                    <div className="space-y-1.5 min-w-[160px]">
                        <label htmlFor="category-filter" className="text-[10px] font-bold uppercase text-muted-foreground px-1">Filtrar por Grupo</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary text-white"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[350px] border rounded-xl p-3 bg-accent/5 shadow-inner">
                    {filteredExercises.length > 0 ? (
                        filteredExercises.map((exercise) => (
                            <button
                                key={exercise.id}
                                type="button"
                                onClick={() => addExercise(exercise)}
                                className="flex items-center justify-between rounded-xl border bg-card p-4 text-left hover:border-brand-primary/50 hover:shadow-md transition-all active:scale-[0.98] animate-in fade-in duration-200"
                            >
                                <div>
                                    <p className="text-sm font-bold">{exercise.name}</p>
                                    <p className="text-[10px] uppercase font-medium text-muted-foreground">{exercise.muscleGroup}</p>
                                </div>
                                <div className="bg-brand-primary/10 p-2 rounded-lg">
                                    <Plus className="h-4 w-4 text-brand-primary" />
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center text-muted-foreground text-xs italic">
                            No hay ejercicios en esta categoría.
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
                                <span>Guardando...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-6 w-6" />
                                <span>{initialRoutine ? 'Actualizar Rutina' : 'Crear Rutina'}</span>
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
