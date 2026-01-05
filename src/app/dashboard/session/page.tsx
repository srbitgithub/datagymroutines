import { getActiveSessionAction, startSessionAction } from "@/app/_actions/training";
import { redirect } from "next/navigation";
import { ListChecks, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { SessionLogger } from "@/modules/training/infrastructure/components/SessionLogger";

export const dynamic = 'force-dynamic';

export default async function SessionPage({ searchParams }: { searchParams: { routineId?: string } }) {
    const activeSession = await getActiveSessionAction();

    // If there's an active session, show the logger
    if (activeSession) {
        return (
            <div className="max-w-4xl mx-auto">
                <SessionLogger session={activeSession} />
            </div>
        );
    }

    // If no active session, we might want to start one if routineId is present
    // But usually, we'd do a "Start" button click. 
    // Let's just show a "No active session" state if we land here directly.
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold">No hay ninguna sesión activa</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">
                Selecciona una rutina o empieza un entrenamiento libre para comenzar a anotar.
            </p>
            <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md bg-brand-primary px-6 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90"
            >
                Ir al Panel
            </Link>
        </div>
    );
}
