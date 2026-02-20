'use client';

import { Star } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

// Set to true when you have real testimonials to display
const SHOW_TESTIMONIALS = false;

const TESTIMONIALS = [
    {
        name: 'Carlos M.',
        plan: 'Pro',
        avatar: 'CM',
        text: 'Llevaba años buscando una app que no me llenase de anuncios ni funciones inútiles. IronMetric es exactamente eso: lo que necesito y nada más.',
        stars: 5,
    },
    {
        name: 'Ana R.',
        plan: 'Elite',
        avatar: 'AR',
        text: 'Las estadísticas me ayudaron a detectar que estaba sobreentrenando pierna. Ahora tengo mis progresiones mucho más controladas.',
        stars: 5,
    },
    {
        name: 'Javi S.',
        plan: 'Pro',
        avatar: 'JS',
        text: 'Migré desde otra app en 10 minutos. La interfaz es muy limpia y en el gym va fluido, sin lag ni pantallas de carga eternas.',
        stars: 5,
    },
    {
        name: 'Laura G.',
        plan: 'Rookie',
        avatar: 'LG',
        text: 'Con el plan gratuito ya tengo todo lo que necesito para llevar mi rutina. Cuando quiera más slots, subo de plan sin dudarlo.',
        stars: 5,
    },
    {
        name: 'Miguel T.',
        plan: 'Elite',
        avatar: 'MT',
        text: 'Los grupos son geniales para entrenar con amigos y comparar progresos. El precio es una ganga para lo que ofrece.',
        stars: 5,
    },
    {
        name: 'Sara P.',
        plan: 'Pro',
        avatar: 'SP',
        text: 'El historial de sesiones me ha cambiado la forma de programar. Saber exactamente qué hice hace 3 semanas vale su peso en oro.',
        stars: 5,
    },
];

export function TestimonialsSection() {
    const { t } = useTranslation();

    if (!SHOW_TESTIMONIALS) return null;

    return (
        <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {t('landing.testimonials_title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((item, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
                        >
                            {/* Stars */}
                            <div className="flex gap-0.5">
                                {Array.from({ length: item.stars }).map((_, s) => (
                                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                &ldquo;{item.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-2 border-t border-border">
                                <div className="h-9 w-9 rounded-full bg-brand-primary/15 flex items-center justify-center">
                                    <span className="text-xs font-bold text-brand-primary">{item.avatar}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Plan {item.plan}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
