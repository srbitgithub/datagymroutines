'use client';

import { useState } from 'react';
import { createCheckoutSessionAction, createCustomerPortalAction } from '@/app/_actions/stripe';
import { SubscriptionTier } from '@/config/subscriptions';
import { Check, Loader2, Zap, Trophy, Star } from 'lucide-react';

interface PricingTableProps {
    currentTier: SubscriptionTier;
}

interface PlanCard {
    tier: 'rookie' | 'pro' | 'elite';
    name: string;
    price: string;
    period: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    features: string[];
    cta: string;
    highlight?: boolean;
}

const PLANS: PlanCard[] = [
    {
        tier: 'rookie',
        name: 'Rookie',
        price: 'Gratis',
        period: 'siempre',
        icon: <Star className="h-5 w-5" />,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20',
        borderColor: 'border-border',
        features: [
            '1 rutina activa (solo editar)',
            '2 publicaciones por semana',
            '3 reacciones por semana',
            'Solo lectura en grupos',
            '7 días de historial',
        ],
        cta: 'Plan actual',
    },
    {
        tier: 'pro',
        name: 'Pro',
        price: '4,99€',
        period: '/mes',
        icon: <Zap className="h-5 w-5" />,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        highlight: true,
        features: [
            '3 rutinas activas',
            '3 publicaciones por semana',
            '8 reacciones por semana',
            '1 grupo social',
            '30 días de historial',
        ],
        cta: 'Pasarse a Pro',
    },
    {
        tier: 'elite',
        name: 'Elite',
        price: '9,99€',
        period: '/mes',
        icon: <Trophy className="h-5 w-5" />,
        color: 'text-brand-primary',
        bgColor: 'bg-brand-primary/5',
        borderColor: 'border-brand-primary/30',
        features: [
            '15 rutinas activas',
            'Publicaciones ilimitadas',
            'Reacciones ilimitadas',
            'Grupos ilimitados',
            'Historial completo',
        ],
        cta: 'Pasarse a Elite',
    },
];

export function PricingTable({ currentTier }: PricingTableProps) {
    const [loading, setLoading] = useState<'pro' | 'elite' | 'portal' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async (tier: 'pro' | 'elite') => {
        setLoading(tier);
        setError(null);
        try {
            await createCheckoutSessionAction(tier);
        } catch (err: any) {
            console.error('Error al iniciar checkout:', err);
            setError(err?.message || 'Error al iniciar el pago. Inténtalo de nuevo.');
            setLoading(null);
        }
    };

    const handleManage = async () => {
        setLoading('portal');
        setError(null);
        try {
            await createCustomerPortalAction();
        } catch (err: any) {
            console.error('Error al abrir portal:', err);
            setError('No se pudo abrir el portal. Puede que tu suscripción no esté gestionada por Stripe (fue asignada manualmente).');
            setLoading(null);
        }
    };

    const isManagedTier = currentTier === 'pro' || currentTier === 'elite';
    const isUnlimitedTier = currentTier === 'free4ever';

    if (isUnlimitedTier) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <span className="text-2xl">∞</span>
                <div>
                    <p className="font-bold text-amber-800 dark:text-amber-200">Plan Free4Ever activo</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Tienes acceso ilimitado a todas las funciones. ¡Gracias!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {isManagedTier && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border text-sm">
                    <span className="text-muted-foreground">Gestiona tu facturación y suscripción</span>
                    <button
                        onClick={handleManage}
                        disabled={loading !== null}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {loading === 'portal' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                        Gestionar suscripción
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                {PLANS.map((plan) => {
                    const isCurrentPlan = currentTier === plan.tier;
                    const isUpgrade =
                        (currentTier === 'rookie' && (plan.tier === 'pro' || plan.tier === 'elite')) ||
                        (currentTier === 'pro' && plan.tier === 'elite');
                    const isDowngrade =
                        (currentTier === 'elite' && plan.tier === 'pro') ||
                        (currentTier === 'pro' && plan.tier === 'rookie') ||
                        (currentTier === 'elite' && plan.tier === 'rookie');

                    return (
                        <div
                            key={plan.tier}
                            className={`relative flex flex-col rounded-xl border p-5 ${plan.bgColor} ${plan.borderColor} ${plan.highlight ? 'ring-2 ring-blue-400/30' : ''}`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="px-3 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full uppercase tracking-wider">
                                        Popular
                                    </span>
                                </div>
                            )}

                            <div className={`flex items-center gap-2 mb-3 ${plan.color}`}>
                                {plan.icon}
                                <span className="font-bold text-sm uppercase tracking-wide">{plan.name}</span>
                            </div>

                            <div className="mb-4">
                                <span className="text-2xl font-extrabold">{plan.price}</span>
                                <span className="text-xs text-muted-foreground ml-1">{plan.period}</span>
                            </div>

                            <ul className="space-y-2 flex-1 mb-5">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs">
                                        <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {isCurrentPlan ? (
                                <div className="py-2 text-center text-xs font-semibold text-muted-foreground bg-muted/40 rounded-lg">
                                    Plan actual
                                </div>
                            ) : plan.tier === 'rookie' ? (
                                isDowngrade ? (
                                    <div className="py-2 text-center text-xs text-muted-foreground">
                                        Cancela desde &ldquo;Gestionar suscripción&rdquo;
                                    </div>
                                ) : null
                            ) : (
                                <button
                                    onClick={() => handleUpgrade(plan.tier as 'pro' | 'elite')}
                                    disabled={loading !== null || isDowngrade}
                                    className={`w-full py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                                        isUpgrade
                                            ? plan.tier === 'elite'
                                                ? 'bg-brand-primary text-white hover:bg-brand-primary/90'
                                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {loading === plan.tier ? (
                                        <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                                    ) : isDowngrade ? (
                                        'Cancela desde portal'
                                    ) : (
                                        plan.cta
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
