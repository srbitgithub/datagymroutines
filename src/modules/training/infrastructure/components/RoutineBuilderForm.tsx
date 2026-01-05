'use client';

import { useState } from 'react';
import { createRoutineAction } from '@/app/_actions/training';
import { Exercise } from '../../domain/Exercise';
import { Plus, GripVertical, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RoutineBuilderFormProps {
    exercises: Exercise[];
}

export function RoutineBuilderForm({ exercises }: RoutineBuilderFormProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const addExercise = (exercise: Exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const removeExercise = (index: number) => {
        setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || selectedExercises.length === 0) return;

        setIsSaving(true);
        const result = await createRoutineAction(
            name,
            description,
            selectedExercises.map((ex) => ex.id)
        );

        setIsSaving(false);
        if (result.success) {
            router.push('/dashboard/routines');
            router.refresh();
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
                        className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                        className="flex w-full rounded-md border border-input bg-background px-4 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ejercicios en la Rutina</h2>
                {selectedExercises.length > 0 ? (
                    <div className="space-y-3">
                        {selectedExercises.map((exercise, index) => (
                            <div key={`${exercise.id}-${index}`} className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-left-2 duration-200">
                                <div className="text-muted-foreground">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{exercise.name}</p>
                                    <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeExercise(index)}
                                    className="text-muted-foreground hover:text-red-500 transition-colors p-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
                        <p className="text-sm text-muted-foreground">Añade ejercicios de la lista inferior.</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Añadir Ejercicios</h2>
                <div className="grid gap-2 overflow-y-auto max-h-[300px] border rounded-lg p-2 bg-accent/5">
                    {exercises.map((exercise) => (
                        <button
                            key={exercise.id}
                            type="button"
                            onClick={() => addExercise(exercise)}
                            className="flex items-center justify-between rounded-md border bg-card p-3 text-left hover:border-brand-primary/50 transition-colors"
                        >
                            <div>
                                <p className="text-sm font-medium">{exercise.name}</p>
                                <p className="text-[10px] uppercase text-muted-foreground">{exercise.muscleGroup}</p>
                            </div>
                            <Plus className="h-4 w-4 text-brand-primary" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t md:relative md:bg-transparent md:border-t-0 md:p-0 md:mt-8 z-50">
                <div className="max-w-2xl mx-auto">
                    <button
                        type="submit"
                        disabled={isSaving || !name || selectedExercises.length === 0}
                        className="flex h-14 w-full items-center justify-center rounded-xl bg-brand-primary text-lg font-bold text-white shadow-lg transition-all hover:bg-brand-primary/90 disabled:opacity-50 active:scale-95"
                    >
                        {isSaving ? "Guardando..." : (
                            <>
                                <Save className="mr-2 h-5 w-5" />
                                Guardar Rutina
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
