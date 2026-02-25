'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

function AppMockup() {
    return (
        <div className="relative mx-auto w-[240px] sm:w-[280px] lg:w-[320px] group perspective-1000">
            {/* Animated Glow */}
            <div className="absolute -inset-8 bg-gradient-to-tr from-brand-primary/40 via-brand-primary/20 to-transparent blur-3xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700 -z-10 animate-pulse-slow" />

            {/* Phone frame with 3D hover effect */}
            <div className="overflow-hidden rounded-[2.5rem] border-[3px] border-foreground/10 shadow-2xl bg-black transition-transform duration-500 ease-out group-hover:-translate-y-4 group-hover:rotate-y-12 group-hover:shadow-brand-primary/30">
                {/* Clip Android green status bar */}
                <div style={{ marginTop: '-14px' }}>
                    <img
                        src="/screenshots/entrenando.jpeg"
                        alt="IronMetric — sesión de entrenamiento en curso"
                        className="w-full block transition-transform duration-700 group-hover:scale-105"
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
        <section className="relative min-h-[100svh] flex items-center pt-24 pb-16 overflow-hidden">
            {/* Background dynamic gradients */}
            <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-brand-primary/10 via-brand-primary/5 to-transparent -z-20" />

            {/* Animated orbs */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-primary/20 rounded-full blur-[100px] mix-blend-screen animate-blob -z-10" />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000 -z-10" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Text content */}
                    <div className="text-center lg:text-left space-y-8">
                        {/* Interactive Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-background/50 backdrop-blur-md px-5 py-2 text-sm font-medium text-brand-primary shadow-sm hover:bg-brand-primary/10 transition-colors cursor-default">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            {t('landing.hero_badge')}
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-foreground">
                            {t('landing.hero_title_1')}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-500">
                                {t('landing.hero_title_2')}
                            </span><br />
                            {t('landing.hero_title_3')}
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-muted-foreground/90 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            {t('landing.hero_subtitle')}
                            {' '}Rutinas, sesiones y estadísticas, sin publicidad ni distracciones.
                        </p>

                        {/* CTAs with Micro-animations */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                            <Link
                                href="/register"
                                className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-brand-primary px-8 text-base font-bold text-white shadow-xl shadow-brand-primary/25 hover:shadow-brand-primary/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <span>{t('landing.hero_cta_primary')}</span>
                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                            <a
                                href="#pricing"
                                className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm px-8 text-base font-bold text-foreground hover:bg-muted/80 hover:border-border transition-all duration-300 hover:-translate-y-1"
                            >
                                {t('landing.hero_cta_secondary')}
                            </a>
                        </div>

                        {/* Social proof hint */}
                        <div className="flex items-center justify-center lg:justify-start gap-4 text-sm font-medium text-muted-foreground pt-4">
                            <span className="flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-500 text-xs text-opacity-80">✓</span>
                                {t('landing.hero_social_no_card')}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-500 text-xs">✓</span>
                                {t('landing.hero_social_free_plan')}
                            </span>
                        </div>
                    </div>

                    {/* App mockup */}
                    <div className="flex justify-center lg:justify-end py-10 lg:py-0 scale-95 sm:scale-100">
                        <AppMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}
