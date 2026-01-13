import { getGymsAction } from "@/app/_actions/auth";
import { GymForm } from "@/modules/gyms/infrastructure/components/GymForm";
import { GymItem } from "@/modules/gyms/infrastructure/components/GymItem";

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
                    <GymItem key={gym.id} gym={gym} />
                ))}
            </div>
        </div>
    );
}
