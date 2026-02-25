'use client';

import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone } from "lucide-react";
import { useTranslation } from "@/core/i18n/TranslationContext";

export function PwaInstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(true); // Default true to avoid flash
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        // Check if already installed
        const isAppMode = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        setIsStandalone(isAppMode);

        if (isAppMode) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Handle Android install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Show prompt for iOS after a slight delay if it's not installed
        if (isIOSDevice) {
            const hasSeenPrompt = localStorage.getItem('hasSeenPwaPrompt');
            if (!hasSeenPrompt) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        }
    };

    const handleClose = () => {
        setShowPrompt(false);
        if (isIOS) {
            localStorage.setItem('hasSeenPwaPrompt', 'true');
        }
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-card border border-brand-primary/20 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                {/* Decorative background */}
                <div className="absolute -right-10 -top-10 bg-brand-primary/5 w-32 h-32 rounded-full blur-2xl" />

                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="bg-brand-primary/10 p-3 rounded-xl shrink-0 mt-1">
                        <Smartphone className="h-6 w-6 text-brand-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-tight mb-1">
                            Lleva tu entrenamiento al gym
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Instala la App en 2 pasos para una experiencia 100% nativa.
                        </p>
                    </div>
                </div>

                {isIOS ? (
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 backdrop-blur-sm mt-1 space-y-3">
                        <p className="text-[11px] font-medium flex items-center gap-2">
                            1. Pulsa <Share className="h-4 w-4 text-brand-secondary" /> en el menú de Safari
                        </p>
                        <p className="text-[11px] font-medium flex items-center gap-2">
                            2. Toca <PlusSquare className="h-4 w-4 text-brand-secondary" /> Añadir a pantalla de inicio
                        </p>
                    </div>
                ) : deferredPrompt ? (
                    <button
                        onClick={handleInstall}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Download className="h-4 w-4" /> Instalar App
                    </button>
                ) : null}
            </div>
        </div>
    );
}
