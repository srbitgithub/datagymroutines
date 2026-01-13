'use client';

import { useState } from 'react';
import { updateGymAction, deleteGymAction } from '@/app/_actions/auth';
import { MapPin, X, Loader2, Trash2 } from 'lucide-react';
import { Gym } from '../../domain/Gym';

interface GymItemProps {
    gym: Gym;
}

export function GymItem({ gym }: GymItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [name, setName] = useState(gym.name || '');
    const [description, setDescription] = useState(gym.description || '');
    const [isDefault, setIsDefault] = useState(gym.isDefault || false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);
        try {
            await updateGymAction(gym.id, name, description, isDefault);
            setIsEditing(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este gimnasio?')) return;
        setIsPending(true);
        try {
            await deleteGymAction(gym.id);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
            setIsDeleting(false);
        }
    };

    if (isEditing) {
        return (
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Editar Gimnasio</h3>
                    <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nombre</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Descripción</label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <label className="text-xs font-medium text-muted-foreground">Predeterminado</label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 inline-flex h-9 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-brand-primary/90 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDeleting(true)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </form>

                {isDeleting && (
                    <div className="pt-4 border-t border-red-100 flex flex-col gap-2">
                        <p className="text-xs text-red-600 font-medium text-center">¿Confirmas la eliminación?</p>
                        <div className="flex gap-2">
                            <button onClick={handleDelete} className="flex-1 text-xs bg-red-600 text-white rounded py-1.5 font-bold">SÍ, BORRAR</button>
                            <button onClick={() => setIsDeleting(false)} className="flex-1 text-xs bg-zinc-100 text-zinc-600 rounded py-1.5">CANCELAR</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4 relative group">
            <div className="flex items-start justify-between">
                <div className="rounded-full bg-brand-primary/10 p-2">
                    <MapPin className="h-4 w-4 text-brand-primary" />
                </div>
                {gym.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                        Predeterminado
                    </span>
                )}
            </div>
            <div>
                <h3 className="font-semibold">{gym.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {gym.description || "Sin descripción"}
                </p>
            </div>
            <div className="pt-2 flex gap-4">
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:opacity-80 transition-opacity"
                >
                    Editar
                </button>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                    Detalles
                </button>
            </div>
        </div>
    );
}
