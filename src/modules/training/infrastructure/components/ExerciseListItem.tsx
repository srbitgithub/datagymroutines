'use client';

import { useState } from 'react';
import { Exercise } from '../../domain/Exercise';
import { Dumbbell, Edit2, Check, X, Loader2, Trash2 } from 'lucide-react';
import { updateExerciseAction, deleteExerciseAction } from '@/app/_actions/training';
import { CustomDialog } from '@/components/ui/CustomDialog';
import { useTranslation } from '@/core/i18n/TranslationContext';

interface ExerciseListItemProps {
    exercise: Exercise;
    onRefresh?: () => void;
}

export function ExerciseListItem({ exercise, onRefresh }: ExerciseListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(exercise.name);
    const [newLoggingType, setNewLoggingType] = useState(exercise.loggingType || 'strength');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });
    const { t } = useTranslation();

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirm(false);
        setIsDeleting(true);
        const result = await deleteExerciseAction(exercise.id);
        setIsDeleting(false);

        if (result.success) {
            if (onRefresh) onRefresh();
        } else {
            setErrorDialog({
                isOpen: true,
                message: result.error || t('common.error')
            });
        }
    };

    const handleSave = async () => {
        if (!newName.trim()) {
            setIsEditing(false);
            setNewName(exercise.name);
            setNewLoggingType(exercise.loggingType || 'strength');
            return;
        }

        if (newName === exercise.name && newLoggingType === exercise.loggingType) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        const result = await updateExerciseAction(exercise.id, {
            name: newName.trim(),
            loggingType: newLoggingType as any
        });
        setIsSaving(false);

        if (result.success) {
            setIsEditing(false);
            if (onRefresh) onRefresh();
        } else {
            setErrorDialog({
                isOpen: true,
                message: result.error || t('common.error')
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNewName(exercise.name);
        setNewLoggingType(exercise.loggingType || 'strength');
    };

    return (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 hover:border-brand-primary/50 transition-colors group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="rounded-full bg-accent p-2 group-hover:bg-brand-primary/10 transition-colors shrink-0">
                    <Dumbbell className="h-4 w-4 text-muted-foreground group-hover:text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                            }}
                            className="w-full bg-accent/20 border-none h-8 px-2 rounded font-medium text-sm focus:ring-1 focus:ring-brand-primary outline-none"
                        />
                    ) : (
                        <div>
                            <p className="text-sm font-medium line-clamp-2 whitespace-normal">{exercise.name}</p>
                            <span className="text-[10px] font-bold uppercase text-brand-primary/60 bg-brand-primary/5 px-1.5 py-0.5 rounded border border-brand-primary/10">
                                {t(`exercises.logging_types.${exercise.loggingType || 'strength'}`)}
                            </span>
                        </div>
                    )}
                    {isEditing && (
                        <div className="mt-2">
                            <select
                                value={newLoggingType}
                                onChange={(e) => setNewLoggingType(e.target.value as any)}
                                className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 h-8 px-2 rounded font-medium text-xs focus:ring-1 focus:ring-brand-primary outline-none"
                            >
                                <option value="strength">{t('exercises.logging_types.strength')}</option>
                                <option value="time">{t('exercises.logging_types.time')}</option>
                                <option value="bodyweight">{t('exercises.logging_types.bodyweight')}</option>
                            </select>
                        </div>
                    )}
                    {exercise.description && !isEditing && (
                        <p className="text-xs text-muted-foreground line-clamp-2 whitespace-normal">
                            {exercise.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 ml-4 shrink-0">
                {isEditing ? (
                    <>
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
                    </>
                ) : (
                    <>
                        {exercise.userId ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent hover:bg-muted transition-colors"
                                    title={t('exercises.edit_title')}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                    title={t('exercises.delete_title')}
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            </>
                        ) : (
                            <span className="text-[10px] font-bold uppercase text-muted-foreground/50 border rounded px-1.5 py-0.5">
                                {t('common.global')}
                            </span>
                        )}
                    </>
                )}
            </div>

            <CustomDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title={t('exercises.delete_title')}
                description={t('exercises.delete_confirm', { name: exercise.name })}
                variant="danger"
                type="confirm"
                confirmLabel={t('common.delete')}
            />

            <CustomDialog
                isOpen={errorDialog.isOpen}
                onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                onConfirm={() => setErrorDialog({ ...errorDialog, isOpen: false })}
                title={t('common.error')}
                description={errorDialog.message}
                variant="danger"
                type="alert"
            />
        </div>
    );
}
