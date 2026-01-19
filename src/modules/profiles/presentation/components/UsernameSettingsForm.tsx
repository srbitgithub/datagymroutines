'use client';

import { useState } from "react";
import { updateUsernameAction } from "@/app/_actions/auth";
import { User, Save, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/core/i18n/TranslationContext";

interface UsernameSettingsFormProps {
    initialUsername: string;
}

export function UsernameSettingsForm({ initialUsername }: UsernameSettingsFormProps) {
    const { t } = useTranslation();
    const [username, setUsername] = useState(initialUsername || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            setMessage({ type: 'error', text: "El nombre de usuario no puede estar vacío" });
            return;
        }

        setIsSaving(true);
        setMessage(null);
        try {
            const result = await updateUsernameAction(username);
            if (result.success) {
                setMessage({ type: 'success', text: t('dashboard.update_success') });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: result.error || t('dashboard.update_error') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('common.connection_error') });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSave} className="grid gap-2">
                <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-brand-primary" />
                    {t('settings.username_label')}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex h-10 w-full max-w-sm rounded-md border border-input px-3 py-2 text-sm bg-background"
                        placeholder={t('settings.username_label')}
                    />
                    <button
                        type="submit"
                        disabled={isSaving || username === initialUsername}
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
                    Este es el nombre que se mostrará en tu perfil y estadísticas.
                </p>
            </form>

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
