'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { getActiveRoutinesAction, deactivateRoutinesAction } from '@/app/_actions/training';
import { SUBSCRIPTION_LIMITS } from '@/config/subscriptions';
import { SubscriptionTier } from '@/config/subscriptions';

interface Props {
    tier: SubscriptionTier;
    onResolved: () => void;
}

export function DowngradeResolutionModal({ tier, onResolved }: Props) {
    const limit = SUBSCRIPTION_LIMITS[tier].maxActiveRoutines;
    const [routines, setRoutines] = useState<{ id: string; name: string }[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getActiveRoutinesAction().then(r => {
            setRoutines(r);
            setLoading(false);
        });
    }, []);

    const mustDeactivate = routines.length - (limit === -1 ? 0 : limit);
    const canConfirm = selected.size >= mustDeactivate;

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleConfirm = async () => {
        setSaving(true);
        setError(null);
        const result = await deactivateRoutinesAction(Array.from(selected));
        if (result.success) {
            onResolved();
        } else {
            setError(result.error ?? 'Error al desactivar rutinas');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (mustDeactivate <= 0) {
        // No excess — resolve immediately
        onResolved();
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200">
                <header className="px-6 py-5 border-b bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <h2 className="font-bold text-amber-900 dark:text-amber-100">Acción requerida</h2>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            Tu plan <span className="font-semibold capitalize">{tier}</span> permite{' '}
                            {limit === 1 ? '1 rutina activa' : `${limit} rutinas activas`}.
                            Tienes {routines.length}. Selecciona {mustDeactivate}{' '}
                            {mustDeactivate === 1 ? 'rutina' : 'rutinas'} para desactivar.
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Las rutinas desactivadas se conservan y puedes reactivarlas si cambias de plan.
                        </p>
                    </div>
                </header>

                <div className="px-4 py-3 max-h-[50vh] overflow-y-auto space-y-2">
                    {routines.map(r => (
                        <label
                            key={r.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                                selected.has(r.id)
                                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                                    : 'hover:bg-muted/50 border-border'
                            }`}
                        >
                            <input
                                type="checkbox"
                                className="accent-amber-500 h-4 w-4"
                                checked={selected.has(r.id)}
                                onChange={() => toggle(r.id)}
                            />
                            <span className="text-sm font-medium">{r.name}</span>
                        </label>
                    ))}
                </div>

                {error && (
                    <p className="px-6 py-2 text-sm text-red-600">{error}</p>
                )}

                <footer className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                        {selected.size}/{mustDeactivate} seleccionadas
                    </span>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm || saving}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Desactivar y continuar
                    </button>
                </footer>
            </div>
        </div>
    );
}
