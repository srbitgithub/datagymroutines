'use client';

import Link from 'next/link';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function LandingFooter() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-border bg-card py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Logo + tagline */}
                    <div className="flex flex-col items-center sm:items-start gap-1">
                        <div className="flex items-center gap-2">
                            <img src="/icons/icon-192x192.png" alt="IronMetric" className="h-6 w-6 object-contain" />
                            <span className="font-bold text-sm">IronMetric</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('landing.footer_tagline')}</p>
                    </div>

                    {/* Links */}
                    <nav className="flex items-center gap-5">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t('landing.footer_login')}
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t('landing.footer_register')}
                        </Link>
                    </nav>
                </div>

                <div className="mt-8 pt-6 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} IronMetric. {t('landing.footer_rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
