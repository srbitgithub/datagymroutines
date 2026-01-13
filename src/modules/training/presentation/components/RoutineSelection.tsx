'use client';

import { Routine } from '../../domain/Routine';
import { Exercise } from '../../domain/Exercise';
import { useSession } from '../contexts/SessionContext';
import { ListChecks, Play, AlertCircle, Dumbbell } from 'lucide-react';
import { useState } from 'react';

interface RoutineSelectionProps {
    routines: Routine[];
    exercises: Exercise[];
}

export function RoutineSelection({ routines, exercises }: RoutineSelectionProps) {
    const { startNewSession, isLoading } = useSession();
    const [startingId, setStartingId] = useState<string | null>(null);

    const handleStart = async (routine: Routine) => {
        setStartingId(routine.id);
        try {
            await startNewSession(routine, exercises);
        } catch (error) {
            alert("Error al iniciar: " + error);
        } finally {
            setStartingId(null);
        }
    };

    if (routines.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold">No tienes rutinas todavía</h2>
                <p className="text-muted-foreground mb-8 max-w-xs">
                    Crea una rutina desde el Panel Principal para empezar a entrenar.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-black uppercase tracking-tight">Elige tu rutina</h2>
                <p className="text-muted-foreground">Selecciona qué vas a entrenar hoy.</p>
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
                                <span className="text-[10px] font-black text-brand-primary uppercase">{routine.exercises.length} Ejercicios</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-black group-hover:text-brand-primary transition-colors">{routine.name}</h3>
                        {routine.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{routine.description}</p>
                        )}
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Empezar ahora</span>
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
        </div>
    );
}
