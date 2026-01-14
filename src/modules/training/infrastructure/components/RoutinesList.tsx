'use client';

import { useState } from "react";
import { ListChecks, Play, GripVertical } from "lucide-react";
import Link from "next/link";
import { Routine } from "../../domain/Routine";
import { RoutineCardActions } from "./RoutineCardActions";
import { updateRoutinesOrderAction } from "@/app/_actions/training";
import { CustomDialog } from "@/components/ui/CustomDialog";
import { useTranslation } from "@/core/i18n/TranslationContext";

interface RoutinesListProps {
    initialRoutines: Routine[];
}

export function RoutinesList({ initialRoutines }: RoutinesListProps) {
    const [routines, setRoutines] = useState(initialRoutines);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });
    const { t } = useTranslation();

    const handleDeleteLocally = (id: string) => {
        setRoutines(prev => prev.filter(r => r.id !== id));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDropTargetIndex(index);

        // Auto-scroll logic
        const threshold = 100; // pixels from edge
        const scrollSpeed = 15;
        const { clientY } = e;
        const viewportHeight = window.innerHeight;

        if (clientY < threshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (clientY > viewportHeight - threshold) {
            window.scrollBy(0, scrollSpeed);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDropTargetIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const newItems = [...routines];
        const [movedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);

        // Update local state immediately for snappy UI
        const reorderedRoutines = newItems.map((r, i) => ({
            ...r,
            orderIndex: i
        }));
        setRoutines(reorderedRoutines);

        setDraggedIndex(null);
        setDropTargetIndex(null);

        // Persist to database
        const orders = reorderedRoutines.map((r, i) => ({
            id: r.id,
            orderIndex: i
        }));

        const result = await updateRoutinesOrderAction(orders);
        if (result.error) {
            setErrorDialog({
                isOpen: true,
                message: result.error || t('common.error')
            });
            // Revert on error if necessary, but usually better to just log
            setRoutines(initialRoutines);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {routines.map((routine, index) => (
                <div
                    key={routine.id}
                    className="relative"
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                >
                    {/* Yellow indicator line */}
                    {dropTargetIndex === index && draggedIndex !== index && (
                        <div className="absolute -top-2 left-0 right-0 h-1 bg-yellow-400 rounded-full z-10 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    )}

                    <div
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnd={handleDragEnd}
                        className={`group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${draggedIndex === index ? 'opacity-40 grayscale' : ''}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-brand-primary/10 p-2 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="h-5 w-5 text-brand-primary" />
                                </div>
                                <RoutineCardActions
                                    routineId={routine.id}
                                    routineName={routine.name}
                                    routineDescription={routine.description || ""}
                                    onDelete={handleDeleteLocally}
                                />
                            </div>
                            <Link
                                href={`/dashboard/session/start?routineId=${routine.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm hover:scale-110 transition-transform"
                                title={t('training.start_now')}
                            >
                                <Play className="h-4 w-4 fill-current ml-0.5" />
                            </Link>
                        </div>
                        <h3 className="text-lg font-bold">{routine.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-4">
                            {routine.description || t('common.no_description')}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground bg-accent px-2 py-1 rounded">
                                {t('dashboard.num_exercises', { count: routine.exercises.length })}
                            </span>
                        </div>
                    </div>

                    {/* Last position indicator */}
                    {dropTargetIndex === index + 1 && draggedIndex !== index && index === routines.length - 1 && (
                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded-full z-10 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                    )}
                </div>
            ))}

            <CustomDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                title={t('common.error')}
                description={errorDialog.message}
                type="alert"
                variant="danger"
            />
        </div>
    );
}
