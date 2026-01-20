'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, LayoutDashboard, Settings, LogOut, BarChart2, Wrench, PlayCircle, ListChecks } from "lucide-react";
import { logoutAction } from "@/app/_actions/auth";
import { SessionProvider } from "@/modules/training/presentation/contexts/SessionContext";
import { TranslationProvider, useTranslation } from "@/core/i18n/TranslationContext";
import { useTheme } from "@/core/theme/ThemeContext";
import { Sun, Moon } from "lucide-react";

function DashboardContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: t('nav.dashboard') },
        { href: "/dashboard/session", icon: PlayCircle, label: t('nav.training') },
        { href: "/dashboard/routines", icon: ListChecks, label: t('nav.routines') },
        { href: "/dashboard/exercises", icon: Dumbbell, label: t('nav.exercises') },
        { href: "/dashboard/tools", icon: Wrench, label: t('nav.tools') },
        { href: "/dashboard/stats", icon: BarChart2, label: t('nav.stats') },
        { href: "/dashboard/settings", icon: Settings, label: t('nav.settings') },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar Mobile (bottom) / Desktop (left) */}
            <aside className="fixed bottom-0 inset-x-0 z-50 border-t bg-card md:static md:w-64 md:border-r md:border-t-0 border-border transition-colors duration-300">
                <div className="flex h-full flex-row items-center justify-around p-2 md:flex-col md:justify-start md:gap-4 md:p-6">
                    <div className="hidden items-center gap-2 md:flex mb-8">
                        <img src="/icons/icon-192x192.png" alt="IronMetric Logo" className="h-8 w-8 object-contain" />
                        <span className="font-bold text-xl tracking-tight text-foreground">IronMetric</span>
                    </div>

                    <nav className="flex w-full flex-row justify-around gap-2 md:flex-col md:justify-start overflow-x-auto no-scrollbar">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-muted shrink-0 ${isActive ? 'text-brand-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 md:h-4 md:w-4 ${isActive ? 'text-brand-primary' : 'text-foreground'}`} />
                                    <span className="md:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto hidden w-full md:flex flex-col gap-2">
                        <button
                            onClick={toggleTheme}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="h-4 w-4" />
                                    <span>{t('settings.appearance.light')}</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="h-4 w-4" />
                                    <span>{t('settings.appearance.dark')}</span>
                                </>
                            )}
                        </button>

                        <form action={logoutAction}>
                            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 cursor-pointer">
                                <LogOut className="h-4 w-4" />
                                <span>{t('nav.logout')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </SessionProvider>
    );
}
