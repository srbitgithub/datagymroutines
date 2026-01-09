import { getActiveSessionAction, startSessionAction, getSessionByIdAction } from "@/app/_actions/training";
import { redirect } from "next/navigation";
import { ListChecks, AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { SessionLogger } from "@/modules/training/infrastructure/components/SessionLogger";

export const dynamic = 'force-dynamic';

export default async function SessionPage({ searchParams }: { searchParams: Promise<{ routineId?: string, debugSessionId?: string }> }) {
    const { routineId, debugSessionId } = await searchParams;
    const data = await getActiveSessionAction();

    // If there's an active session, show the logger
    if (data?.session) {
        return (
            <div className="max-w-4xl mx-auto">
                <SessionLogger
                    session={data.session}
                    exercises={data.exercises}
                    routine={data.routine}
                />
            </div>
        );
    }

    // If no active session, we might want to start one if routineId is present
    // But usually, we'd do a "Start" button click. 
    // Let's just show a "No active session" state if we land here directly.

    // DEBUG UI: Si venimos de crear una sesión pero no aparece como activa
    if (debugSessionId && !data?.session) {
        const debugSession = await getSessionByIdAction(debugSessionId);
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border-2 border-red-200 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-6 w-6" />
                    <h2 className="font-bold text-lg">Diagnóstico de Fallo</h2>
                </div>
                <div className="text-sm font-mono bg-white p-4 rounded border">
                    <p><strong>Intentando cargar ID:</strong> {debugSessionId}</p>
                    <p><strong>Encontrada en DB:</strong> {debugSession ? "SÍ ✅" : "NO ❌"}</p>
                    {debugSession && (
                        <>
                            <p><strong>Start Time:</strong> {debugSession.startTime.toISOString()}</p>
                            <p><strong>End Time:</strong> {debugSession.endTime ? debugSession.endTime.toISOString() : "NULL (Correcto)"}</p>
                            <p><strong>User ID:</strong> {debugSession.userId}</p>
                        </>
                    )}
                </div>
                <p className="text-xs text-red-600">
                    Si "Encontrada" es NO, la inserción falló silenciosamente o RLS la oculta.
                    <br />
                    Si "End Time" tiene fecha, se cerró automáticamente por error.
                </p>
                <Link href="/dashboard" className="block text-center text-sm font-bold underline">Volver al inicio</Link>
            </div>
        );
    }

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
