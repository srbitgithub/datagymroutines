'use client';

import { useActionState, useState, useEffect } from 'react';
import { createExerciseAction } from '@/app/_actions/training';
import { Plus, Loader2 } from 'lucide-react';

export function ExerciseForm() {
    const [state, action, isPending] = useActionState(createExerciseAction, null);
    const [name, setName] = useState('');
    const [muscleGroup, setMuscleGroup] = useState('Pecho');

    useEffect(() => {
        if (state?.success) {
            setName('');
        }
    }, [state]);

    return (
        <form action={action} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
            <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Nombre</label>
                <input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Press inclinado"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="muscleGroup" className="text-xs font-bold uppercase text-muted-foreground">Grupo Muscular</label>
                <select
                    id="muscleGroup"
                    name="muscleGroup"
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-zinc-800 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-white"
                >
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Piernas">Piernas</option>
                    <option value="Hombros">Hombros</option>
                    <option value="Antebrazos">Antebrazos</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Core">Core</option>
                    <option value="Otros">Otros</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-6 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Añadir"}
            </button>

            {state?.error && (
                <p className="text-xs text-red-500 col-span-full">{state.error}</p>
            )}
            {state?.success && (
                <p className="text-xs text-green-500 col-span-full">¡Ejercicio añadido!</p>
            )}
        </form>
    );
}
