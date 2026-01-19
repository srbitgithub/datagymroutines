import { getAdminStatsAction } from "@/app/_actions/admin";
import { AdminDashboardUI } from "@/modules/admin/presentation/components/AdminDashboardUI";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const result = await getAdminStatsAction(12); // Default 1 año

    if (result.error === "No autorizado") {
        redirect("/admin");
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <AdminDashboardUI initialData={result.data} />
        </div>
    );
}
