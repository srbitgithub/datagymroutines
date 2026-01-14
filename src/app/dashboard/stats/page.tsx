'use client';

import { useState, useEffect } from 'react';
import { getExercisesAction, getExerciseProgressAction } from '@/app/_actions/training';
import { Exercise } from '@/modules/training/domain/Exercise';
import { ExerciseProgressChart } from '@/modules/training/infrastructure/components/ExerciseProgressChart';
import { BarChart2, Search, Dumbbell, Loader2, ChevronRight, Activity } from 'lucide-react';

export default function StatsPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingChart, setLoadingChart] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadExercises = async () => {
            const data = await getExercisesAction();
            setExercises(data);
            setLoading(false);
        };
        loadExercises();
    }, []);

    const handleSelectExercise = async (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setLoadingChart(true);
        const result = await getExerciseProgressAction(exercise.id);
        if (result.success) {
            setProgressData(result.data);
        }
        setLoadingChart(false);
    };

    const filteredExercises = exercises.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.muscleGroup && e.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 text-brand-primary animate-spin" />
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-zinc-500">Cargando datos...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-primary/10 p-2 rounded-xl">
                        <BarChart2 className="h-6 w-6 text-brand-primary" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Evolución</h1>
                </div>
                <p className="text-muted-foreground text-sm font-medium">Analiza tus picos de fuerza y progreso histórico.</p>
            </header>

            {!selectedExercise ? (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Busca un ejercicio (ej: Press de Banca)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-14 pl-12 pr-4 bg-zinc-900 border-zinc-800 rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-brand-primary transition-all outline-none text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredExercises.map(exercise => (
                            <button
                                key={exercise.id}
                                onClick={() => handleSelectExercise(exercise)}
                                className="flex items-center justify-between p-4 rounded-2xl border bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-brand-primary/50 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                                        <Dumbbell className="h-6 w-6 text-zinc-500 group-hover:text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">{exercise.name}</h3>
                                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                                            {exercise.muscleGroup}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-white transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <button
                        onClick={() => setSelectedExercise(null)}
                        className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
                    >
                        ← Volver a la lista
                    </button>

                    {loadingChart ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Activity className="h-10 w-10 text-brand-primary animate-bounce" />
                            <p className="mt-4 text-xs font-bold uppercase text-zinc-600">Procesando historial...</p>
                        </div>
                    ) : (
                        <ExerciseProgressChart
                            data={progressData}
                            exerciseName={selectedExercise.name}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
