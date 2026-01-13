import { getExercisesAction, getRoutinesAction } from "@/app/_actions/training";
import { RoutineSessionManager } from "@/modules/training/presentation/components/RoutineSessionManager";

export const dynamic = 'force-dynamic';

export default async function SessionPage() {
    const routines = await getRoutinesAction();
    const exercises = await getExercisesAction();

    return (
        <div className="max-w-4xl mx-auto">
            <RoutineSessionManager routines={routines} exercises={exercises} />
        </div>
    );
}
