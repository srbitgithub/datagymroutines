'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, ListChecks } from "lucide-react";
import { useTranslation } from "@/core/i18n/TranslationContext";

export function LibrarySwitcher() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isRoutines = pathname.startsWith('/dashboard/routines');
    const isExercises = pathname.startsWith('/dashboard/exercises');

    if (!isRoutines && !isExercises) return null;

    return (
        <div className="flex bg-card border border-border p-1 rounded-xl mb-6 max-w-sm mx-auto shadow-sm">
            <Link
                href="/dashboard/routines"
                className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-medium rounded-lg transition-all ${isRoutines ? 'bg-brand-primary text-white shadow' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
                <ListChecks className="w-4 h-4 mr-2" />
                {t('nav.routines', { defaultValue: 'Rutinas' })}
            </Link>
            <Link
                href="/dashboard/exercises"
                className={`flex-1 flex justify-center items-center py-2 px-3 text-sm font-medium rounded-lg transition-all ${isExercises ? 'bg-brand-primary text-white shadow' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
            >
                <Dumbbell className="w-4 h-4 mr-2" />
                {t('nav.exercises', { defaultValue: 'Ejercicios' })}
            </Link>
        </div>
    );
}
