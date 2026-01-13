'use client';

import { useState } from "react";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { deleteRoutineAction } from "@/app/_actions/training";
import { useRouter } from "next/navigation";

interface RoutineCardActionsProps {
    routineId: string;
    routineName: string;
}

export function RoutineCardActions({ routineId, routineName }: RoutineCardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar la rutina "${routineName}"?`)) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteRoutineAction(routineId);
        setIsDeleting(false);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/dashboard/routines/${routineId}/edit`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent hover:bg-zinc-800 transition-colors"
                title="Editar rutina"
            >
                <Edit2 className="h-4 w-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                title="Borrar rutina"
            >
                {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Trash2 className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
