'use client';

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Home, Settings, LogOut, BarChart2, Wrench, PlayCircle, ListChecks, Users2, Library } from "lucide-react";
import { logoutAction, getProfileAction } from "@/app/_actions/auth";
import { SessionProvider } from "@/modules/training/presentation/contexts/SessionContext";
import { TranslationProvider, useTranslation } from "@/core/i18n/TranslationContext";
import { useTheme } from "@/core/theme/ThemeContext";
import { NotificationCenter } from "@/modules/social/presentation/components/NotificationCenter";
import { ProfileProvider, useProfile } from "@/modules/profiles/presentation/contexts/ProfileContext";
import { DowngradeResolutionModal } from "@/modules/training/presentation/components/DowngradeResolutionModal";
import { SUBSCRIPTION_LIMITS } from "@/config/subscriptions";
import { getActiveRoutinesAction } from "@/app/_actions/training";
import { DrawerMenu } from "@/modules/core/presentation/components/DrawerMenu";
import { LibrarySwitcher } from "@/modules/core/presentation/components/LibrarySwitcher";
import { InitialOnboardingModal } from "@/modules/profiles/presentation/components/InitialOnboardingModal";

function DashboardContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const { profile } = useProfile();
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);

    const isHeaderVisible = profile?.isSocialActive !== false && profile?.isNotificationsActive !== false;

    // Check for excess active routines after a downgrade
    useEffect(() => {
        if (!profile?.tier) return;
        const limit = SUBSCRIPTION_LIMITS[profile.tier].maxActiveRoutines;
        if (limit === -1) return; // unlimited — no check needed
        getActiveRoutinesAction().then(active => {
            if (active.length > limit) setShowDowngradeModal(true);
        });
    }, [profile?.tier]);

    const navItems: Array<{ href: string; icon: any; label: string; matchPaths?: string[] }> = [
        { href: "/dashboard", icon: Home, label: t('nav.dashboard') },
        { href: "/dashboard/session", icon: PlayCircle, label: t('nav.training') },
        { href: "/dashboard/social", icon: Users2, label: "Social" },
        { href: "/dashboard/routines", matchPaths: ["/dashboard/routines", "/dashboard/exercises"], icon: Library, label: t('nav.library', { defaultValue: 'Biblioteca' }) },
        { href: "/dashboard/stats", icon: BarChart2, label: t('nav.stats') }
    ];

    return (
        <>
            {showDowngradeModal && profile?.tier && (
                <DowngradeResolutionModal
                    tier={profile.tier}
                    onResolved={() => setShowDowngradeModal(false)}
                />
            )}

            <InitialOnboardingModal />

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
                                const isActive = item.matchPaths
                                    ? item.matchPaths.some(p => pathname.startsWith(p))
                                    : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
                    </div>
                </aside>

                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <header className="flex items-center justify-between px-4 py-3 border-b bg-card/30 backdrop-blur-md md:px-6">
                        <DrawerMenu />
                        <div className="flex items-center gap-2">
                            {isHeaderVisible && <NotificationCenter />}
                        </div>
                    </header>
                    <div className={`flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto no-scrollbar`}>
                        <LibrarySwitcher />
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ProfileProvider>
                <DashboardContent>
                    {children}
                </DashboardContent>
            </ProfileProvider>
        </SessionProvider>
    );
}
