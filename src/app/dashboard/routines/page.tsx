import { getRoutinesAction } from "@/app/_actions/training";
import { Plus, ListChecks } from "lucide-react";
import Link from "next/link";
import { RoutinesList } from "@/modules/training/infrastructure/components/RoutinesList";

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
    const routines = await getRoutinesAction();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Rutinas</h1>
                    <p className="text-muted-foreground">
                        Diseña tus entrenamientos para ser más eficiente en el gimnasio.
                    </p>
                </div>
                <Link
                    href="/dashboard/routines/new"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Rutina
                </Link>
            </header>

            {routines.length > 0 ? (
                <RoutinesList initialRoutines={routines} />
            ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                    <ListChecks className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h2 className="text-lg font-semibold">No tienes rutinas todavía</h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                        Crea una rutina para agrupar tus ejercicios y registrar tus progresos más rápido.
                    </p>
                    <Link
                        href="/dashboard/routines/new"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
                    >
                        Crear mi primera rutina
                    </Link>
                </div>
            )}
        </div>
    );
}
