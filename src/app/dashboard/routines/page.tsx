import { getRoutinesAction } from "@/app/_actions/training";
import { Plus, ListChecks } from "lucide-react";
import Link from "next/link";
import { RoutinesList } from "@/modules/training/infrastructure/components/RoutinesList";
import { ContextualTooltip } from "@/modules/core/presentation/components/ContextualTooltip";

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
    const routines = await getRoutinesAction();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <ContextualTooltip id="tooltip_routines" title="Planes de ataque" message="Combina los ejercicios para crear tu plan de entrenamiento ideal." />
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
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-primary/20 bg-brand-primary/5 py-24 text-center px-4">
                    <div className="bg-brand-primary/10 p-6 rounded-full mb-6">
                        <ListChecks className="h-12 w-12 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Aún no hay rutinas</h2>
                    <p className="text-muted-foreground mb-8 max-w-sm">
                        Combina tus ejercicios favoritos para crear un plan de ataque. Agrupar ejercicios te permitirá registrar tus entrenamientos como una máquina.
                    </p>
                    <Link
                        href="/dashboard/routines/new"
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-primary px-8 font-black text-white uppercase tracking-widest shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 hover:bg-brand-primary/90 active:scale-95"
                    >
                        Crear mi primera rutina
                    </Link>
                </div>
            )}
        </div>
    );
}
