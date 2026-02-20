'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function FinalCTA() {
    const { t } = useTranslation();

    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-brand-primary px-8 py-16 sm:px-16 sm:py-20 text-center">
                    {/* Decorative blobs */}
                    <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative space-y-6">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                            {t('landing.cta_title')}
                        </h2>
                        <p className="text-white/75 text-lg max-w-md mx-auto">
                            {t('landing.cta_subtitle')}
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-primary hover:bg-white/90 transition-colors shadow-xl"
                        >
                            {t('landing.cta_button')}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
