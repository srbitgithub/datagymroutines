'use client';

import { useState } from "react";
import { Edit2, Trash2, Loader2, Copy } from "lucide-react";
import Link from "next/link";
import { deleteRoutineAction, duplicateRoutineAction } from "@/app/_actions/training";
import { useRouter } from "next/navigation";
import { CustomDialog } from "@/components/ui/CustomDialog";

interface RoutineCardActionsProps {
    routineId: string;
    routineName: string;
    routineDescription: string;
}

export function RoutineCardActions({ routineId, routineName, routineDescription }: RoutineCardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showError, setShowError] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
    const router = useRouter();

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        setIsDeleting(true);
        const result = await deleteRoutineAction(routineId);
        setIsDeleting(false);

        if (result.success) {
            router.refresh();
        } else {
            setShowError({ isOpen: true, message: result.error || "Error al borrar la rutina" });
        }
    };

    const handleDuplicate = async () => {
        // Since I don't want to use window.prompt, I'll use a fixed copy name for now 
        // to follow the "no browser dialogs" rule strictly without adding a complex prompt modal yet.
        // OR I can quickly add an Input modal. Let's go with a simple alert for now if I can't prompt.
        // Wait, the user said "all browser dialogs". Prompt is a dialog.
        // I will implement a generic InputDialog or just use a default name for now.
        // Actually, let's just use default name and notify user.

        setIsDuplicating(true);
        const result = await duplicateRoutineAction(routineId, `${routineName} (copia)`, routineDescription);
        setIsDuplicating(false);

        if (result.success) {
            router.refresh();
        } else {
            setShowError({ isOpen: true, message: result.error || "Error al duplicar la rutina" });
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
                onClick={handleDuplicate}
                disabled={isDuplicating}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent hover:bg-zinc-800 transition-colors disabled:opacity-50"
                title="Duplicar rutina"
            >
                {isDuplicating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
            </button>
            <button
                onClick={handleDeleteClick}
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

            <CustomDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Borrar rutina"
                description={`¿Estás seguro de que quieres borrar la rutina "${routineName}"?`}
                variant="danger"
                type="confirm"
                confirmLabel="Borrar"
            />

            <CustomDialog
                isOpen={showError.isOpen}
                onClose={() => setShowError({ ...showError, isOpen: false })}
                onConfirm={() => setShowError({ ...showError, isOpen: false })}
                title="Error"
                description={showError.message}
                variant="danger"
                type="alert"
            />
        </div>
    );
}
