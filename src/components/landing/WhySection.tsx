'use client';

import { ShieldOff, BadgeCheck, Dumbbell } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function WhySection() {
    const { t } = useTranslation();

    const items = [
        {
            icon: ShieldOff,
            title: t('landing.why_1_title'),
            desc: t('landing.why_1_desc'),
        },
        {
            icon: BadgeCheck,
            title: t('landing.why_2_title'),
            desc: t('landing.why_2_desc'),
        },
        {
            icon: Dumbbell,
            title: t('landing.why_3_title'),
            desc: t('landing.why_3_desc'),
        },
    ];

    return (
        <section className="py-20 sm:py-28 bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {t('landing.why_title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-4">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
                                <item.icon className="h-6 w-6 text-brand-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
