import { getGymsAction } from "@/app/_actions/auth";
import { GymForm } from "@/modules/gyms/infrastructure/components/GymForm";
import { MapPin, Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function GymsPage() {
    const gyms = await getGymsAction();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mis Gimnasios</h1>
                    <p className="text-muted-foreground">
                        Gestiona los lugares donde entrenas para mantener la coherencia en tus cargas.
                    </p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* New Gym Card / Form Toggle */}
                <section className="rounded-xl border border-dashed bg-card/50 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[160px]">
                    <GymForm />
                </section>

                {gyms.map((gym) => (
                    <div key={gym.id} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="rounded-full bg-brand-primary/10 p-2">
                                <MapPin className="h-4 w-4 text-brand-primary" />
                            </div>
                            {gym.isDefault && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                                    Predeterminado
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold">{gym.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {gym.description || "Sin descripción"}
                            </p>
                        </div>
                        <div className="pt-2 flex gap-2">
                            <button className="text-xs font-medium text-muted-foreground hover:text-foreground">
                                Editar
                            </button>
                            <button className="text-xs font-medium text-red-500/80 hover:text-red-500">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
