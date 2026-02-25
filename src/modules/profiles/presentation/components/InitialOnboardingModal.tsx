'use client';

import { useState, useEffect } from "react";
import { useProfile } from "@/modules/profiles/presentation/contexts/ProfileContext";
import { Dumbbell, Users, Bell, ChevronRight, CheckCircle2 } from "lucide-react";
import { updateProfileAction } from "@/app/_actions/auth";
import { useTranslation } from "@/core/i18n/TranslationContext";

export function InitialOnboardingModal() {
    const { profile, refreshProfile } = useProfile();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // States for steps
    const [step, setStep] = useState(1);

    // Form states
    const [monthlyGoal, setMonthlyGoal] = useState<number>(12);
    const [isSearchable, setIsSearchable] = useState<boolean>(true);
    const [isNotificationsActive, setIsNotificationsActive] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Only open if profile exists and monthlyGoal is null/undefined
        // meaning they haven't set their preferences yet.
        if (profile && (profile.monthlyGoal === null || profile.monthlyGoal === undefined)) {
            setIsOpen(true);
        }
    }, [profile]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!profile) return;
        setIsSubmitting(true);
        try {
            await updateProfileAction(profile.id, {
                monthlyGoal,
                isSearchable,
                isNotificationsActive
            });
            await refreshProfile();
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving onboarding preferences:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="bg-brand-primary/10 p-6 text-center border-b border-brand-primary/10">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-brand-primary">
                        {t('onboarding_modal.welcome')}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-2">
                        {t('onboarding_modal.subtitle')}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex h-1.5 w-full bg-zinc-800/50">
                    <div
                        className="h-full bg-brand-primary transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* Steps Content */}
                <div className="p-8">
                    {/* STEP 1: Monthly Goal */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-brand-primary/20 p-2.5 rounded-xl">
                                    <Dumbbell className="h-6 w-6 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold">{t('onboarding_modal.step1_title')}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('onboarding_modal.step1_desc')}
                            </p>

                            <div className="grid gap-3">
                                {[
                                    { value: 4, label: t('onboarding_modal.step1_opt1_label'), desc: t('onboarding_modal.step1_opt1_desc') },
                                    { value: 12, label: t('onboarding_modal.step1_opt2_label'), desc: t('onboarding_modal.step1_opt2_desc') },
                                    { value: 20, label: t('onboarding_modal.step1_opt3_label'), desc: t('onboarding_modal.step1_opt3_desc') }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setMonthlyGoal(opt.value)}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${monthlyGoal === opt.value
                                            ? 'border-brand-primary bg-brand-primary/10'
                                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-bold text-white">{opt.label}</div>
                                            <div className="text-xs text-muted-foreground">{opt.desc}</div>
                                        </div>
                                        {monthlyGoal === opt.value && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Privacy */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-brand-primary/20 p-2.5 rounded-xl">
                                    <Users className="h-6 w-6 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold">{t('onboarding_modal.step2_title')}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('onboarding_modal.step2_desc')}
                            </p>

                            <div className="grid gap-3">
                                <button
                                    onClick={() => setIsSearchable(true)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSearchable
                                        ? 'border-brand-primary bg-brand-primary/10'
                                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{t('onboarding_modal.step2_opt1_label')}</div>
                                        <div className="text-xs text-muted-foreground">{t('onboarding_modal.step2_opt1_desc')}</div>
                                    </div>
                                    {isSearchable && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                                </button>
                                <button
                                    onClick={() => setIsSearchable(false)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${!isSearchable
                                        ? 'border-brand-primary bg-brand-primary/10'
                                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{t('onboarding_modal.step2_opt2_label')}</div>
                                        <div className="text-xs text-muted-foreground">{t('onboarding_modal.step2_opt2_desc')}</div>
                                    </div>
                                    {!isSearchable && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Notifications */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-brand-primary/20 p-2.5 rounded-xl">
                                    <Bell className="h-6 w-6 text-brand-primary" />
                                </div>
                                <h3 className="text-lg font-bold">{t('onboarding_modal.step3_title')}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('onboarding_modal.step3_desc')}
                            </p>

                            <div className="grid gap-3">
                                <button
                                    onClick={() => setIsNotificationsActive(true)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isNotificationsActive
                                        ? 'border-brand-primary bg-brand-primary/10'
                                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{t('onboarding_modal.step3_opt1_label')}</div>
                                        <div className="text-xs text-muted-foreground">{t('onboarding_modal.step3_opt1_desc')}</div>
                                    </div>
                                    {isNotificationsActive && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                                </button>
                                <button
                                    onClick={() => setIsNotificationsActive(false)}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${!isNotificationsActive
                                        ? 'border-brand-primary bg-brand-primary/10'
                                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-bold text-white">{t('onboarding_modal.step3_opt2_label')}</div>
                                        <div className="text-xs text-muted-foreground">{t('onboarding_modal.step3_opt2_desc')}</div>
                                    </div>
                                    {!isNotificationsActive && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 pt-0 flex justify-between gap-4">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 rounded-xl border border-zinc-700 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            {t('common.cancel', { defaultValue: 'Atrás' })}
                        </button>
                    ) : (
                        <div></div> /* Placeholder for Flex alignment */
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all"
                        >
                            {t('onboarding_modal.next_button')} <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isSubmitting ? (
                                <span className="block h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t('onboarding_modal.finish_button')
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
