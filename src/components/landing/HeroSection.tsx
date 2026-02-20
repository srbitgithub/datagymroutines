'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

function AppMockup() {
    const exercises = [
        { name: 'Press banca', info: '4×8 · 80 kg', done: true },
        { name: 'Press militar', info: '3×10 · 50 kg', done: true },
        { name: 'Fondos', info: '3×12 · Peso', done: false },
        { name: 'Cruces', info: '3×15 · 15 kg', done: false },
    ];

    return (
        <div className="relative mx-auto w-[260px] sm:w-[280px]">
            {/* Glow */}
            <div className="absolute -inset-6 bg-brand-primary/15 blur-3xl rounded-full -z-10" />
            {/* Phone frame */}
            <div className="rounded-[2.5rem] border-2 border-foreground/15 bg-card shadow-2xl overflow-hidden">
                {/* Status bar */}
                <div className="bg-foreground/5 px-5 py-1.5 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-medium">9:41</span>
                    <span className="text-[10px] text-muted-foreground font-medium">IronMetric</span>
                </div>
                {/* App header */}
                <div className="bg-brand-primary px-4 py-3">
                    <p className="text-white text-xs font-bold">Sesión de hoy</p>
                    <p className="text-white/70 text-[10px] mt-0.5">Empujón · 4 ejercicios</p>
                </div>
                {/* Exercise rows */}
                <div className="divide-y divide-border">
                    {exercises.map((ex, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold leading-tight">{ex.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{ex.info}</p>
                            </div>
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                ex.done
                                    ? 'bg-brand-primary border-brand-primary'
                                    : 'border-muted-foreground/40'
                            }`}>
                                {ex.done && (
                                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Progress + button */}
                <div className="px-4 pb-5 pt-3">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-brand-primary rounded-full w-1/2 transition-all" />
                    </div>
                    <div className="bg-brand-primary rounded-xl px-4 py-2 text-center">
                        <span className="text-white text-xs font-semibold">Finalizar sesión</span>
                    </div>
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
