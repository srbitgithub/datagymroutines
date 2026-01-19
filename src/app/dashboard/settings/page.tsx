'use client';

import { getProfileAction, logoutAction, getUserSessionAction } from "@/app/_actions/auth";
import { User, Mail, Weight, LogOut, Loader2, Shield } from "lucide-react";
import { GoalSettingsForm } from "@/modules/profiles/presentation/components/GoalSettingsForm";
import { GenderSettingsForm } from "@/modules/profiles/presentation/components/GenderSettingsForm";
import { useEffect, useState } from "react";
import { useTranslation } from "@/core/i18n/TranslationContext";

export default function SettingsPage() {
    const { t } = useTranslation();
    const [profile, setProfile] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [p, u] = await Promise.all([
                    getProfileAction(),
                    getUserSessionAction()
                ]);
                setProfile(p);
                setUser(u);
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                <p className="text-muted-foreground">{t('settings.subtitle')}</p>
            </header>

            <div className="grid gap-6">
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-brand-primary" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-semibold">{t('settings.profile_section')}</h2>
                                {profile?.role === 'Elite' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-primary text-white rounded-full uppercase tracking-widest animate-pulse">
                                        Elite
                                    </span>
                                )}
                                {profile?.role === 'Free4Ever' && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                        Free4Ever
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user?.email || t('common.loading')}</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {t('settings.email_label')}
                            </label>
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                {user?.email}
                            </div>
                        </div>

                        {profile && (
                            <>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">{t('settings.username_label')}</label>
                                    <div className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-muted/20">
                                        {profile.username || t('common.not_set')}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Weight className="h-4 w-4" />
                                        {t('settings.weight_unit_label')}
                                    </label>
                                    <div className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-muted/20 capitalize">
                                        {t(`common.units.${profile.weightUnit}`)}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        {t('settings.role_label')}
                                    </label>
                                    <div className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-muted/20">
                                        {t(`settings.plans.${profile.role?.toLowerCase() || 'rookie'}`)}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <GenderSettingsForm initialGender={profile.gender || 'male'} />
                                </div>

                                <div className="pt-4 border-t">
                                    <GoalSettingsForm initialGoal={profile.monthlyGoal || 20} />
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        {t('settings.danger_zone')}
                    </h2>
                    <p className="text-sm text-red-700 mb-6">
                        {t('settings.danger_zone_desc')}
                    </p>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2 cursor-pointer"
                        >
                            {t('nav.logout')}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
