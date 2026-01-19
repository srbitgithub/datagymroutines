import { getExercisesAction, getRoutineByIdAction } from "@/app/_actions/training";
import { RoutineBuilderForm } from "@/modules/training/infrastructure/components/RoutineBuilderForm";
import { notFound } from "next/navigation";

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [exercises, routine] = await Promise.all([
        getExercisesAction(true),
        getRoutineByIdAction(id)
    ]);

    if (!routine) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Editar Rutina</h1>
                <p className="text-muted-foreground">
                    Modifica los ejercicios, el orden o las series de tu rutina.
                </p>
            </header>

            <RoutineBuilderForm exercises={exercises} initialRoutine={routine} />
        </div>
    );
}
