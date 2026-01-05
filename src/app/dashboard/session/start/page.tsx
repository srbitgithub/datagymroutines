import { startSessionAction } from "@/app/_actions/training";
import { redirect } from "next/navigation";

export default async function StartSessionPage({ searchParams }: { searchParams: { routineId?: string } }) {
    const routineId = searchParams.routineId;

    const result = await startSessionAction(routineId);

    if (result.success) {
        redirect("/dashboard/session");
    }

    // Handle error (maybe redirect back with error param)
    redirect("/dashboard");
}
