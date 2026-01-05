import { getProfileAction, getGymsAction } from "@/app/_actions/auth";
import { Plus, MapPin, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const profile = await getProfileAction();
    const gyms = await getGymsAction();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Hola, {profile?.fullName || profile?.username || "Atleta"}
                    </h1>
                    <p className="text-muted-foreground">
                        Bienvenido a tu cuaderno de fuerza digital.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/settings"
                        className="rounded-full p-2 hover:bg-accent transition-colors"
                        title="Configuración"
                    >
                        <SettingsIcon className="h-5 w-5" />
                    </Link>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Session Start */}
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-2">Comenzar entrenamiento</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Selecciona una rutina o empieza una sesión vacía.
                    </p>
                    <button className="w-full inline-flex h-12 items-center justify-center rounded-md bg-brand-primary px-8 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90">
                        Nueva Sesión Vacía
                    </button>
                </section>

                {/* Gym Status */}
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Gimnasio Actual</h2>
                        <Link href="/dashboard/gyms" className="text-xs text-brand-primary hover:underline">
                            Gestionar
                        </Link>
                    </div>

                    {gyms.length > 0 ? (
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-brand-primary/10 p-3">
                                <MapPin className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{gyms.find(g => g.isDefault)?.name || gyms[0].name}</p>
                                <p className="text-xs text-muted-foreground">Configurado para seguimiento</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-sm text-muted-foreground mb-4">Aún no has configurado ningún gimnasio.</p>
                            <Link href="/dashboard/gyms" className="inline-flex items-center text-xs font-medium text-brand-primary">
                                <Plus className="mr-1 h-3 w-3" />
                                Añadir gimnasio
                            </Link>
                        </div>
                    )}
                </section>
            </div>

            {/* Recent History Placeholder */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Sesiones recientes</h2>
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                    <p className="text-muted-foreground mb-2">No hay sesiones registradas todavía.</p>
                    <p className="text-sm text-muted-foreground">
                        Tus últimos entrenamientos aparecerán aquí para un acceso rápido.
                    </p>
                </div>
            </section>
        </div>
    );
}
