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
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Prevent body scroll when menu is open on mobile
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [menuOpen]);

    const navLinks = [
        { href: '#features', label: t('landing.nav_features') },
        { href: '#pricing', label: t('landing.nav_pricing') },
        { href: '#faq', label: t('landing.nav_faq') },
    ];

    return (
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'pt-2 sm:pt-4 px-4 sm:px-6' : 'pt-4 px-4 sm:px-6'
            }`}>
            <div className={`mx-auto max-w-6xl transition-all duration-500 ease-in-out ${scrolled
                ? 'bg-background/70 backdrop-blur-xl shadow-lg border border-border/50 rounded-2xl py-2 px-4 shadow-foreground/5'
                : 'bg-transparent py-4 px-2 hover:bg-background/20 hover:backdrop-blur-sm'
                }`}>
                <div className="flex h-12 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 shrink-0 group">
                        <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-black flex items-center justify-center transition-transform group-hover:scale-105">
                            <img src="/icons/icon-192x192.png" alt="IronMetric" className="h-[90%] w-[90%] object-contain scale-110" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">IronMetric</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-inner transition-all duration-300 hover:scale-105"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </button>
                        <Link
                            href="/login"
                            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                        >
                            {t('landing.nav_login')}
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-blue-500 px-5 text-sm font-bold text-white shadow-md shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all duration-300 hover:brightness-110"
                        >
                            {t('landing.nav_start')}
                        </Link>
                    </div>

                    {/* Mobile actions */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-muted-foreground hover:bg-muted/80 transition-all duration-300 hover:scale-105"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="relative z-50 p-2 rounded-xl text-foreground hover:bg-muted/80 transition-all duration-300 hover:scale-105"
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out transform ${menuOpen ? 'scale-0 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'}`} />
                                <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ease-out transform ${menuOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-90'}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu overlay */}
            <div
                className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out flex flex-col pt-24 px-6 ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
                    }`}
            >
                <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
                    {navLinks.map((link, i) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className={`block text-2xl font-bold text-foreground transition-all duration-500 ease-out transform ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
                            style={{ transitionDelay: `${i * 50}ms` }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <div className="mt-8 pt-8 flex flex-col gap-4 border-t border-border/50">
                        <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className={`block text-xl font-bold text-muted-foreground hover:text-foreground transition-all duration-500 ease-out transform ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ transitionDelay: '150ms' }}
                        >
                            {t('landing.nav_login')}
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setMenuOpen(false)}
                            className={`inline-flex h-14 items-center justify-center w-full rounded-2xl bg-gradient-to-r from-brand-primary to-blue-500 text-lg font-bold text-white shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all duration-500 ease-out transform ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                            style={{ transitionDelay: '200ms' }}
                        >
                            {t('landing.nav_start')}
                        </Link>
                    </div>
                </div>
            </div>
        </header >
    );
}
