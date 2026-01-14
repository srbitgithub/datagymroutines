'use client';

import { DiskCalculator } from "@/modules/tools/infrastructure/components/DiskCalculator";
import { RestTimer } from "@/modules/tools/infrastructure/components/RestTimer";
import { useTranslation } from "@/core/i18n/TranslationContext";

export default function ToolsPage() {
    const { t } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t('tools.title')}</h1>
                <p className="text-muted-foreground">{t('tools.subtitle')}</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <DiskCalculator />
                <RestTimer />
            </div>
        </div>
    );
}
