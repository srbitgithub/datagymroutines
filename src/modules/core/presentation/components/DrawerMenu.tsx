'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Settings, Share2, QrCode, Wrench, LogOut, X } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';
import { logoutAction } from '@/app/_actions/auth';
import { createPortal } from 'react-dom';

export function DrawerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const [showQR, setShowQR] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleWebShare = async () => {
        const shareData = {
            title: 'IronMetric',
            text: t('common.share_text', { defaultValue: 'Únete a IronMetric, controla tus entrenamientos y progresa.' }),
            url: 'https://datagymroutines.vercel.app/'
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert(t('common.link_copied', { defaultValue: 'Enlace copiado al portapapeles' }));
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-full hover:bg-zinc-800/10 dark:hover:bg-zinc-800/50 transition-colors focus:ring-2 focus:ring-brand-primary/50 outline-none"
                aria-label="Abrir menú"
            >
                <Menu className="w-6 h-6" />
            </button>

            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-72 max-w-[80vw] h-full bg-card border-r border-border shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="p-4 border-b border-border flex justify-between items-center">
                            <span className="font-bold text-lg">IronMetric</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                            <Link href="/dashboard/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors font-medium">
                                <Settings className="w-5 h-5 text-muted-foreground" />
                                {t('nav.settings', { defaultValue: 'Ajustes' })}
                            </Link>

                            <button onClick={handleWebShare} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors font-medium text-left">
                                <Share2 className="w-5 h-5 text-muted-foreground" />
                                {t('nav.share', { defaultValue: 'Compartir con..' })}
                            </button>

                            <button onClick={() => { setIsOpen(false); setShowQR(true); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors font-medium text-left">
                                <QrCode className="w-5 h-5 text-muted-foreground" />
                                {t('nav.qr', { defaultValue: 'Compartir con QR' })}
                            </button>

                            <Link href="/dashboard/tools" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors font-medium">
                                <Wrench className="w-5 h-5 text-muted-foreground" />
                                {t('nav.tools', { defaultValue: 'Herramientas' })}
                            </Link>

                            <div className="h-[1px] bg-border my-2"></div>

                            <form action={logoutAction}>
                                <button type="submit" className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-red-500/10 text-red-500 transition-colors font-medium text-left">
                                    <LogOut className="w-5 h-5" />
                                    {t('nav.logout', { defaultValue: 'Cerrar Sesión' })}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {mounted && showQR && createPortal(
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 py-8 overflow-y-auto animate-in fade-in duration-200">
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 mt-4 sm:mt-0">IronMetric</h3>
                        <p className="text-sm text-zinc-400 font-medium mb-6 text-center">
                            {t('common.scan_qr', { defaultValue: 'Escanea este código para acceder a la aplicación' })}
                        </p>

                        <div className="bg-white p-4 rounded-2xl w-full max-w-[240px] aspect-square flex items-center justify-center shrink-0">
                            <img
                                src="/qrcode_IronMetric.png"
                                alt="IronMetric QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
