'use client';

import { useEffect, useState } from 'react';

export function PWAUpdateToast() {
    const [showReload, setShowReload] = useState(false);
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Check for waiting worker on load
            navigator.serviceWorker.getRegistration().then((reg) => {
                if (reg?.waiting) {
                    setWaitingWorker(reg.waiting);
                    setShowReload(true);
                }

                // Listen for new updates
                if (reg) {
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setWaitingWorker(newWorker);
                                    setShowReload(true);
                                }
                            });
                        }
                    });
                }
            });
        }
    }, []);

    const reloadPage = () => {
        waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
        setShowReload(false);
        window.location.reload();
    };

    if (!showReload) return null;

    return (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto z-[100] p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-sm font-medium text-white">
                    Nueva versión disponible
                </span>
            </div>
            <button
                onClick={reloadPage}
                className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-zinc-200 transition-colors"
            >
                Actualizar
            </button>
        </div>
    );
}
