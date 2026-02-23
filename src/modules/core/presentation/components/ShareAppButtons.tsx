'use client';

import { useState } from 'react';
import { QrCode, Share2, X } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function ShareAppButtons() {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);

    const handleWebShare = async () => {
        const shareData = {
            title: 'IronMetric',
            text: t('common.share_text') || 'Únete a IronMetric, controla tus entrenamientos y progresa.',
            url: 'https://datagymroutines.vercel.app/'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback si la API no está soportada (e.g., copiando al portapapeles)
                await navigator.clipboard.writeText(shareData.url);
                alert(t('common.link_copied') || 'Enlace copiado al portapapeles');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 mr-4">
                <button
                    onClick={() => setShowModal(true)}
                    className="p-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-brand-primary transition-colors focus:ring-2 focus:ring-brand-primary/50 outline-none"
                    aria-label="Código QR"
                    title="Mostrar Código QR"
                >
                    <QrCode className="w-5 h-5" />
                </button>
                <button
                    onClick={handleWebShare}
                    className="p-2 rounded-full bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary transition-colors focus:ring-2 focus:ring-brand-primary/50 outline-none"
                    aria-label="Compartir aplicación"
                    title="Compartir enlace de la aplicación"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* QR Code Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 py-8 overflow-y-auto animate-in fade-in duration-200">
                    <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 my-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 mt-4 sm:mt-0">IronMetric</h3>
                        <p className="text-sm text-zinc-400 font-medium mb-6 text-center">
                            {t('common.scan_qr') || 'Escanea este código para acceder a la aplicación'}
                        </p>

                        <div className="bg-white p-4 rounded-2xl w-full max-w-[240px] aspect-square flex items-center justify-center shrink-0">
                            <img
                                src="/qrcode_IronMetric.png"
                                alt="IronMetric QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
