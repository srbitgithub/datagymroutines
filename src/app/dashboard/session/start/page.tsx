'use client';

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { startSessionAction } from "@/app/_actions/training";
import { Loader2 } from "lucide-react";

function StartSessionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const routineId = searchParams.get("routineId") || undefined;

    useEffect(() => {
        const start = async () => {
            try {
                const result = await startSessionAction(routineId);

                if (result.success) {
                    // Forzar actualización de cache antes de navegar
                    router.refresh();
                    // Pasar el ID para depuración
                    setTimeout(() => router.replace(`/dashboard/session?debugSessionId=${result.sessionId}`), 100);
                } else {
                    const errorMessage = result.error || "Error desconocido al iniciar sesión";
                    router.replace(`/dashboard?error=${encodeURIComponent(errorMessage)}`);
                }
            } catch (err: any) {
                router.replace(`/dashboard?error=${encodeURIComponent(err.message || "Error de red")}`);
            }
        };
        start();
    }, [routineId, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-in fade-in zoom-in duration-300">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-brand-primary" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Preparando tu entrenamiento...</h2>
            <p className="text-sm opacity-70">Estamos configurando tu sesión</p>
        </div>
    );
}

export default function StartSessionPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <StartSessionContent />
        </Suspense>
    );
}
