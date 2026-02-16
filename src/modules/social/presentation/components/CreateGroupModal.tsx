'use client';

import { useState } from "react";
import { createGroupAction } from "@/app/_actions/social";
import { Loader2, X, Users2 } from "lucide-react";

interface CreateGroupModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
    const [name, setName] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsPending(true);
        setError(null);

        try {
            const result = await createGroupAction(name);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Ocurrió un error al crear el grupo");
            }
        } catch (err: any) {
            setError(err.message || "Error inesperado");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                            <Users2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Nuevo Grupo</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre del Grupo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Los Guerreros del Gym"
                            className="w-full h-11 px-4 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                            autoFocus
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-medium shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isPending ? (
                                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                            ) : (
                                "Crear Grupo"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
