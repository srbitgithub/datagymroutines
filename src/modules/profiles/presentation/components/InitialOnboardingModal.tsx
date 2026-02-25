'use client';

import { useState, useEffect } from "react";
import { useProfile } from "@/modules/profiles/presentation/contexts/ProfileContext";
import { Dumbbell, Users, Bell, ChevronRight, CheckCircle2 } from "lucide-react";
import { updateProfileAction } from "@/app/_actions/auth";

export function InitialOnboardingModal() {
    const { profile, refreshProfile } = useProfile();
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
                        Bienvenido a IronMetric
                    </h2>
                    <p className="text-muted-foreground text-sm mt-2">
                        Configura tu perfil en 3 sencillos pasos para empezar con buen pie.
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
                                <h3 className="text-lg font-bold">1. ¿Cuál es tu objetivo?</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                ¿Cuántas veces quieres entrenar al mes? Esto ajustará las gráficas de tu vista principal.
                            </p>

                            <div className="grid gap-3">
                                {[
                                    { value: 4, label: "Una vez por semana", desc: "4 días/mes" },
                                    { value: 12, label: "Constante", desc: "12 días/mes (3/semana)" },
                                    { value: 20, label: "Modo Bestia 🦍", desc: "20 días/mes (5/semana)" }
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
                                <h3 className="text-lg font-bold">2. Privacidad Social</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                ¿Quieres ser visible para que tus amigos te encuentren y te inviten a grupos?
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
                                        <div className="font-bold text-white">Sí, mostrar mi perfil</div>
                                        <div className="text-xs text-muted-foreground">Podrán encontrarte por tu nombre</div>
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
                                        <div className="font-bold text-white">No, mantenerme oculto</div>
                                        <div className="text-xs text-muted-foreground">Modo fantasma activado</div>
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
                                <h3 className="text-lg font-bold">3. Notificaciones</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                ¡No te pierdas de nada! ¿Quieres que te avisemos cuando alguien reaccione a tu entreno?
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
                                        <div className="font-bold text-white">¡Dame ese extra de motivación!</div>
                                        <div className="text-xs text-muted-foreground">Recibe alertas sociales</div>
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
                                        <div className="font-bold text-white">No, prefiero entrenar en silencio</div>
                                        <div className="text-xs text-muted-foreground">Sin notificaciones</div>
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
                            Atrás
                        </button>
                    ) : (
                        <div></div> /* Placeholder for Flex alignment */
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-brand-primary text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-105 active:scale-95 transition-all"
                        >
                            Siguiente <ChevronRight className="h-4 w-4" />
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
                                "¡A entrenar!"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
