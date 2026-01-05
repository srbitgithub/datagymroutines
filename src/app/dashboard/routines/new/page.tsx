import { getExercisesAction } from "@/app/_actions/training";
import { RoutineBuilderForm } from "@/modules/training/infrastructure/components/RoutineBuilderForm";

export default async function NewRoutinePage() {
    const exercises = await getExercisesAction();

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Nueva Rutina</h1>
                <p className="text-muted-foreground">
                    Selecciona los ejercicios y el orden para tu nueva plantilla.
                </p>
            </header>

            <RoutineBuilderForm exercises={exercises} />
        </div>
    );
}
