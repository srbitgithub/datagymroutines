'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

function AppMockup() {
    return (
        <div className="relative mx-auto w-[220px] sm:w-[260px]">
            {/* Glow */}
            <div className="absolute -inset-6 bg-brand-primary/15 blur-3xl rounded-full -z-10" />
            {/* Phone frame */}
            <div className="overflow-hidden rounded-[2.5rem] border-2 border-foreground/15 shadow-2xl bg-black">
                {/* Clip Android green status bar */}
                <div style={{ marginTop: '-14px' }}>
                    <img
                        src="/screenshots/entrenando.jpeg"
                        alt="IronMetric — sesión de entrenamiento en curso"
                        className="w-full block"
                        priority-fetch="high"
                    />
                </div>
            </div>
        </div>
    );
}

export function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 via-transparent to-transparent -z-10" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl -z-10" />

            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Text content */}
                    <div className="text-center lg:text-left space-y-6">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-brand-primary/5 px-4 py-1.5 text-sm font-medium text-brand-primary">
                            {t('landing.hero_badge')}
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                            Tu entreno,<br />
                            <span className="text-brand-primary">tus datos,</span><br />
                            sin líos.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            {t('landing.hero_subtitle')}
                            {' '}Rutinas, sesiones y estadísticas, sin publicidad ni ruido.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                            <Link
                                href="/register"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 text-base font-semibold text-white hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25"
                            >
                                {t('landing.hero_cta_primary')}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#pricing"
                                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-8 text-base font-semibold text-foreground hover:bg-muted transition-colors"
                            >
                                {t('landing.hero_cta_secondary')}
                            </a>
                        </div>

                        {/* Social proof hint */}
                        <p className="text-xs text-muted-foreground">
                            ✓ Sin tarjeta de crédito &nbsp;·&nbsp; ✓ Plan gratuito disponible
                        </p>
                    </div>

                    {/* App mockup */}
                    <div className="flex justify-center lg:justify-end">
                        <AppMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
