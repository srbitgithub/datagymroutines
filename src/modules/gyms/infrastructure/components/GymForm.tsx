'use client';

import { useActionState, useState } from 'react';
import { createGymAction } from '@/app/_actions/auth';
import { Plus, X, Loader2 } from 'lucide-react';

export function GymForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, isPending] = useActionState(createGymAction, null);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-brand-primary transition-colors"
            >
                <div className="rounded-full border border-dashed p-3 group-hover:border-brand-primary group-hover:bg-brand-primary/5">
                    <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Añadir Gimnasio</span>
            </button>
        );
    }

    return (
        <div className="w-full text-left animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nuevo Gimnasio</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <form action={action} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Nombre</label>
                    <input
                        id="name"
                        name="name"
                        required
                        placeholder="Ej: McFit, Garaje..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-xs font-bold uppercase text-muted-foreground">Descripción (opcional)</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={2}
                        placeholder="Ej: Poleas pesadas, barras olímpicas..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="isDefault" className="text-xs font-medium text-muted-foreground">
                        Marcar como predeterminado
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isPending ? "Guardando..." : "Guardar Gimnasio"}
                </button>

                {state?.error && (
                    <p className="text-xs text-red-500 mt-2">{state.error}</p>
                )}
            </form>
        </div>
    );
}
