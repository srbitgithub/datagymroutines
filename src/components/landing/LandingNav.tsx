'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';
import { useTheme } from '@/core/theme/ThemeContext';

export function LandingNav() {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { href: '#features', label: t('landing.nav_features') },
        { href: '#pricing', label: t('landing.nav_pricing') },
        { href: '#faq', label: t('landing.nav_faq') },
    ];

    return (
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm border-b border-border' : 'bg-transparent'
        }`}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <img src="/icons/icon-192x192.png" alt="IronMetric" className="h-7 w-7 object-contain" />
                        <span className="font-bold text-lg tracking-tight">IronMetric</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <Link
                            href="/login"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {t('landing.nav_login')}
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex h-9 items-center rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
                        >
                            {t('landing.nav_start')}
                        </Link>
                    </div>

                    {/* Mobile actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                            aria-label="Toggle menu"
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="pt-2 flex flex-col gap-2 border-t border-border">
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                            {t('landing.nav_login')}
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setMenuOpen(false)}
                            className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
                        >
                            {t('landing.nav_start')}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
