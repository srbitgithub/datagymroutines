'use client';

import React from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle, Save } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

interface CustomDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    type?: 'alert' | 'confirm';
    variant?: 'info' | 'success' | 'danger' | 'warning';
    confirmLabel?: string;
    cancelLabel?: string;
    onCancelClick?: () => void;
}
export function CustomDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    type = 'confirm',
    variant = 'info',
    confirmLabel,
    cancelLabel,
    onCancelClick
}: CustomDialogProps) {
    const { t } = useTranslation();
    const finalConfirmLabel = confirmLabel || t('common.confirm');
    const finalCancelLabel = cancelLabel || t('common.cancel');

    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'success': return <CheckCircle2 className="h-8 w-8 text-green-500" />;
            case 'danger': return <X className="h-8 w-8 text-red-500" />;
            case 'warning': return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
            default: return <Info className="h-8 w-8 text-brand-primary" />;
        }
    };

    const getIconBg = () => {
        switch (variant) {
            case 'success': return 'bg-green-500/20';
            case 'danger': return 'bg-red-500/20';
            case 'warning': return 'bg-yellow-500/20';
            default: return 'bg-brand-primary/20';
        }
    };

    const getConfirmBtnClass = () => {
        switch (variant) {
            case 'success': return 'bg-green-600 hover:bg-green-500';
            case 'danger': return 'bg-red-600 hover:bg-red-500';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-500';
            default: return 'bg-brand-primary hover:bg-brand-primary/90';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-center space-y-4">
                    <div className={`w-16 h-16 ${getIconBg()} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {getIcon()}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                    <p className="text-zinc-400 font-medium">{description}</p>
                </div>

                <div className={`grid ${type === 'confirm' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mt-8`}>
                    {type === 'confirm' && (
                        <button
                            onClick={() => {
                                if (onCancelClick) {
                                    onCancelClick();
                                } else {
                                    onClose();
                                }
                            }}
                            className="py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all uppercase text-sm"
                        >
                            {finalCancelLabel}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm();
                            if (type === 'alert') onClose();
                        }}
                        className={`py-4 ${getConfirmBtnClass()} text-white font-black rounded-2xl transition-all uppercase text-sm shadow-lg`}
                    >
                        {finalConfirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
