'use client';

import { useActionState, useEffect, useState } from "react";
import { updateGenderAction } from "@/app/_actions/auth";
import { useTranslation } from "@/core/i18n/TranslationContext";
import { Loader2, Users } from "lucide-react";

interface GenderSettingsFormProps {
    initialGender?: 'male' | 'female' | 'other';
}

export function GenderSettingsForm({ initialGender = 'male' }: GenderSettingsFormProps) {
    const { t } = useTranslation();
    const [gender, setGender] = useState(initialGender);
    const [isPending, setIsPending] = useState(false);

    const handleGenderChange = async (newGender: 'male' | 'female' | 'other') => {
        setGender(newGender);
        setIsPending(true);
        try {
            await updateGenderAction(newGender);
        } catch (error) {
            console.error("Failed to update gender", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="grid gap-2">
            <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Género (para frases motivacionales)
            </label>
            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg border border-input">
                <button
                    onClick={() => handleGenderChange('male')}
                    disabled={isPending}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${gender === 'male' ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-accent text-muted-foreground'}`}
                >
                    {isPending && gender === 'male' ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Hombre"}
                </button>
                <button
                    onClick={() => handleGenderChange('female')}
                    disabled={isPending}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${gender === 'female' ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-accent text-muted-foreground'}`}
                >
                    {isPending && gender === 'female' ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Mujer"}
                </button>
                <button
                    onClick={() => handleGenderChange('other')}
                    disabled={isPending}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${gender === 'other' ? 'bg-brand-primary text-white shadow-sm' : 'hover:bg-accent text-muted-foreground'}`}
                >
                    {isPending && gender === 'other' ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Otro"}
                </button>
            </div>
        </div>
    );
}
