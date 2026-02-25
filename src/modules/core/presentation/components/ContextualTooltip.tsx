'use client';

import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";

interface ContextualTooltipProps {
    id: string;
    title: string;
    message: string;
    delay?: number;
    position?: 'bottom-right' | 'top-center';
}

export function ContextualTooltip({ id, title, message, delay = 1000, position = 'bottom-right' }: ContextualTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(id);
        if (!hasSeen) {
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        }
    }, [id, delay]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(id, 'true');
    };

    if (!isVisible) return null;

    const positionClasses = position === 'bottom-right'
        ? "fixed bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100vw-2rem)] md:w-80"
        : "fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] md:w-96";

    return (
        <div className={`${positionClasses} z-50 animate-in slide-in-from-bottom-5 fade-in duration-500`}>
            <div className="bg-brand-primary text-white border border-brand-primary-light rounded-2xl shadow-[0_10px_40px_rgba(255,89,36,0.3)] p-4 flex gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1.5 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl h-fit shrink-0">
                    <Lightbulb className="h-5 w-5 text-white" />
                </div>

                <div className="pr-4 z-10">
                    <h4 className="font-black text-sm uppercase tracking-tight mb-1">{title}</h4>
                    <p className="text-sm font-medium text-white/90 leading-snug">
                        {message}
                    </p>
                    <button
                        onClick={handleDismiss}
                        className="mt-3 text-[10px] font-black uppercase tracking-widest bg-white text-brand-primary px-3 py-1.5 rounded-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
