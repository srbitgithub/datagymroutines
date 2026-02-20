'use client';

import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function PricingSection() {
    const { t } = useTranslation();

    const plans = [
        {
            key: 'rookie',
            name: t('landing.plan_rookie'),
            price: t('landing.plan_free'),
            perMonth: null,
            popular: false,
            features: [
                t('landing.plan_rookie_routines'),
                t('landing.plan_rookie_history'),
                t('landing.plan_rookie_social'),
                t('landing.plan_rookie_posts'),
            ],
            cta: t('landing.plan_cta_free'),
            href: '/register',
            variant: 'outline' as const,
        },
        {
            key: 'pro',
            name: t('landing.plan_pro'),
            price: t('landing.plan_pro_price'),
            perMonth: t('landing.plan_per_month'),
            popular: true,
            features: [
                t('landing.plan_pro_routines'),
                t('landing.plan_pro_history'),
                t('landing.plan_pro_groups'),
                t('landing.plan_pro_posts'),
            ],
            cta: t('landing.plan_cta_pro'),
            href: '/register',
            variant: 'primary' as const,
        },
        {
            key: 'elite',
            name: t('landing.plan_elite'),
            price: t('landing.plan_elite_price'),
            perMonth: t('landing.plan_per_month'),
            popular: false,
            features: [
                t('landing.plan_elite_routines'),
                t('landing.plan_elite_history'),
                t('landing.plan_elite_groups'),
                t('landing.plan_elite_posts'),
            ],
            cta: t('landing.plan_cta_elite'),
            href: '/register',
            variant: 'outline' as const,
        },
    ];

    return (
        <section id="pricing" className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                        {t('landing.pricing_title')}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        {t('landing.pricing_subtitle')}
                    </p>
                </div>

                {/* Early adopter banner */}
                <div className="mb-10 mx-auto max-w-2xl rounded-2xl border border-amber-400/40 bg-amber-400/8 px-5 py-4 flex items-start gap-3">
                    <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                            {t('landing.pricing_early_badge')}
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                            {t('landing.pricing_early_desc')}
                        </p>
                    </div>
                </div>

                {/* Plans grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.key}
                            className={`relative rounded-2xl border p-6 flex flex-col gap-6 ${
                                plan.popular
                                    ? 'border-brand-primary shadow-xl shadow-brand-primary/10 bg-card ring-1 ring-brand-primary'
                                    : 'border-border bg-card'
                            }`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow">
                                        {t('landing.plan_popular')}
                                    </span>
                                </div>
                            )}

                            {/* Plan name + price */}
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">{plan.name}</p>
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                                    {plan.perMonth && (
                                        <span className="text-muted-foreground text-sm mb-1">{plan.perMonth}</span>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="flex flex-col gap-2.5">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm">
                                        <Check className="h-4 w-4 text-brand-primary shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href={plan.href}
                                className={`mt-auto inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                                    plan.variant === 'primary'
                                        ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                                        : 'border border-border hover:bg-muted'
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
