import { getAdminStatsAction } from "@/app/_actions/admin";
import { AdminDashboardUI } from "@/modules/admin/presentation/components/AdminDashboardUI";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const result = await getAdminStatsAction(12);

    if (result.error) {
        if (result.error === "No autorizado") {
            redirect("/admin");
        }

        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-zinc-900 border border-red-900/50 p-8 rounded-3xl">
                    <h1 className="text-2xl font-black text-red-500 uppercase mb-4">Error de Servidor</h1>
                    <div className="bg-red-500/10 p-4 rounded-xl text-red-400 font-mono text-sm mb-6">
                        {result.error}
                    </div>
                    <p className="text-zinc-400 text-sm mb-6">
                        Este error suele ocurrir por falta de variables de entorno en Vercel (especialmente SUPABASE_SERVICE_ROLE_KEY) o por un fallo en la conexión con la base de datos.
                    </p>
                    <a href="/dashboard" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                        Volver al Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <AdminDashboardUI initialData={result.data} />
        </div>
    );
}
