'use client';

import { ListChecks, Zap, BarChart2, History, Users2, Smartphone } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function FeaturesSection() {
    const { t } = useTranslation();

    const features = [
        {
            icon: ListChecks,
            title: t('landing.feature_1_title'),
            desc: t('landing.feature_1_desc'),
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            icon: Zap,
            title: t('landing.feature_2_title'),
            desc: t('landing.feature_2_desc'),
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/10',
        },
        {
            icon: BarChart2,
            title: t('landing.feature_3_title'),
            desc: t('landing.feature_3_desc'),
            color: 'text-green-500',
            bg: 'bg-green-500/10',
        },
        {
            icon: History,
            title: t('landing.feature_4_title'),
            desc: t('landing.feature_4_desc'),
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
        },
        {
            icon: Users2,
            title: t('landing.feature_5_title'),
            desc: t('landing.feature_5_desc'),
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
        },
        {
            icon: Smartphone,
            title: t('landing.feature_6_title'),
            desc: t('landing.feature_6_desc'),
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
    ];

    return (
        <section id="features" className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        {t('landing.features_title')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('landing.features_subtitle')}
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-6 hover:border-brand-primary/30 transition-colors group"
                        >
                            <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} mb-4`}>
                                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                            </div>
                            <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
