import { getExercisesAction } from "@/app/_actions/training";
import { ExerciseForm } from "@/modules/training/infrastructure/components/ExerciseForm";
import { Dumbbell, Plus, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ExercisesPage() {
    const exercises = await getExercisesAction();

    // Agrupar por grupo muscular
    const groups = exercises.reduce((acc, exercise) => {
        const group = exercise.muscleGroup || 'Otros';
        if (!acc[group]) acc[group] = [];
        acc[group].push(exercise);
        return acc;
    }, {} as Record<string, typeof exercises>);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Ejercicios</h1>
                    <p className="text-muted-foreground">
                        Explora o añade ejercicios personalizados a tu cuaderno.
                    </p>
                </div>
            </header>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-brand-primary" />
                    Nuevo Ejercicio Personalizado
                </h2>
                <ExerciseForm />
            </div>

            <div className="space-y-8">
                {Object.entries(groups).sort().map(([group, groupExercises]) => (
                    <section key={group} className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">
                            {group}
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2">
                            {groupExercises.map((exercise) => (
                                <div key={exercise.id} className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-brand-primary/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-accent p-2 group-hover:bg-brand-primary/10 transition-colors">
                                            <Dumbbell className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{exercise.name}</p>
                                            {exercise.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {exercise.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {!exercise.userId && (
                                        <span className="text-[10px] font-bold uppercase text-muted-foreground/50 border rounded px-1.5 py-0.5">
                                            Global
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
