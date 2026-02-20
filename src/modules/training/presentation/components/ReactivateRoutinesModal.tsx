'use client';

import { useState, useEffect } from 'react';
import { Zap, Loader2, X } from 'lucide-react';
import { getDeactivatedRoutinesAction, reactivateRoutinesAction } from '@/app/_actions/training';
import { SUBSCRIPTION_LIMITS } from '@/config/subscriptions';
import { SubscriptionTier } from '@/config/subscriptions';

interface Props {
    tier: SubscriptionTier;
    onClose: () => void;
}

export function ReactivateRoutinesModal({ tier, onClose }: Props) {
    const limit = SUBSCRIPTION_LIMITS[tier].maxActiveRoutines;
    const [deactivated, setDeactivated] = useState<{ id: string; name: string }[]>([]);
    const [currentActive, setCurrentActive] = useState(0);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            getDeactivatedRoutinesAction(),
            import('@/app/_actions/training').then(m => m.getActiveRoutinesAction()),
        ]).then(([inactive, active]) => {
            setDeactivated(inactive);
            setCurrentActive(active.length);
            setLoading(false);
        });
    }, []);

    const slotsAvailable = limit === -1 ? Infinity : limit - currentActive;

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else if (limit === -1 || next.size < slotsAvailable) {
                next.add(id);
            }
            return next;
        });
    };

    const handleConfirm = async () => {
        if (!selected.size) { onClose(); return; }
        setSaving(true);
        setError(null);
        const result = await reactivateRoutinesAction(Array.from(selected));
        if (result.success) {
            onClose();
        } else {
            setError(result.error ?? 'Error al reactivar rutinas');
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

    if (deactivated.length === 0) {
        onClose();
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-background w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200">
                <header className="px-6 py-5 border-b flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                        <div>
                            <h2 className="font-bold">¡Plan actualizado!</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Tienes {deactivated.length} {deactivated.length === 1 ? 'rutina desactivada' : 'rutinas desactivadas'}.
                                {limit !== -1
                                    ? ` Puedes reactivar hasta ${slotsAvailable} con tu plan ${tier}.`
                                    : ' Puedes reactivarlas todas.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="px-4 py-3 max-h-[50vh] overflow-y-auto space-y-2">
                    {deactivated.map(r => {
                        const isSelected = selected.has(r.id);
                        const isDisabled = !isSelected && limit !== -1 && selected.size >= slotsAvailable;
                        return (
                            <label
                                key={r.id}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                                    isDisabled
                                        ? 'opacity-40 cursor-not-allowed border-border'
                                        : isSelected
                                            ? 'bg-brand-primary/5 border-brand-primary/30 cursor-pointer'
                                            : 'hover:bg-muted/50 border-border cursor-pointer'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="accent-brand-primary h-4 w-4"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => !isDisabled && toggle(r.id)}
                                />
                                <span className="text-sm font-medium">{r.name}</span>
                            </label>
                        );
                    })}
                </div>

                {error && (
                    <p className="px-6 py-2 text-sm text-red-600">{error}</p>
                )}

                <footer className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Ahora no
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {selected.size > 0 ? `Reactivar ${selected.size}` : 'Continuar'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
