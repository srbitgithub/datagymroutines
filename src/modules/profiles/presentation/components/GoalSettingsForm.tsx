'use client';

import { useState } from "react";
import { updateMonthlyGoalAction } from "@/app/_actions/auth";
import { Target, Save, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/core/i18n/TranslationContext";

interface GoalSettingsFormProps {
    initialGoal: number;
}

export function GoalSettingsForm({ initialGoal }: GoalSettingsFormProps) {
    const { t } = useTranslation();
    const [goal, setGoal] = useState(initialGoal);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await updateMonthlyGoalAction(goal);
            if (result.success) {
                setMessage({ type: 'success', text: t('dashboard.update_success') });
            } else {
                setMessage({ type: 'error', text: result.error || t('dashboard.update_error') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('common.connection_error') });
        } finally {
            setIsSaving(false);
            // Clear success message after 3 seconds
            if (message?.type === 'success') {
                setTimeout(() => setMessage(null), 3000);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand-secondary" />
                    {t('dashboard.goal_title')}
                </label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={goal}
                        onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                        className="flex h-10 w-24 rounded-md border border-input px-3 py-2 text-sm bg-background"
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        {t('common.save')}
                    </button>
                </div>
                <p className="text-[12px] text-muted-foreground">
                    {t('dashboard.goal_hint')}
                </p>
            </div>

            {message && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
