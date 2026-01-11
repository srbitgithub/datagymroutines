'use client';

import { useState } from 'react';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Edit2, Check, X, Loader2 } from 'lucide-react';
import { updateExerciseAction } from '@/app/_actions/training';

interface ExerciseListItemProps {
    exercise: Exercise;
}

export function ExerciseListItem({ exercise }: ExerciseListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(exercise.name);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!newName.trim() || newName === exercise.name) {
            setIsEditing(false);
            setNewName(exercise.name);
            return;
        }

        setIsSaving(true);
        const result = await updateExerciseAction(exercise.id, newName.trim());
        setIsSaving(false);

        if (result.success) {
            setIsEditing(false);
        } else {
            alert(result.error || "Error al actualizar el ejercicio");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewName(exercise.name);
    };

    return (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-brand-primary/50 transition-colors group">
            <div className="flex items-center gap-3 flex-1">
                <div className="rounded-full bg-accent p-2 group-hover:bg-brand-primary/10 transition-colors shrink-0">
                    <Dumbbell className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary" />
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2 w-full">
                            <input
                                autoFocus
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                                className="flex-1 bg-accent/20 border-none h-8 px-2 rounded font-medium text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                            />
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group/title">
                            <p className="text-sm font-medium">{exercise.name}</p>
                            {exercise.userId && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="opacity-0 group-hover/title:opacity-100 p-1 text-muted-foreground hover:text-brand-primary transition-all"
                                >
                                    <Edit2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    )}
                    {exercise.description && !isEditing && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {exercise.description}
                        </p>
                    )}
                </div>
            </div>
            {!exercise.userId && (
                <span className="text-[10px] font-bold uppercase text-muted-foreground/50 border rounded px-1.5 py-0.5 shrink-0">
                    Global
                </span>
            )}
        </div>
    );
}
