'use client';

import { useState, useEffect } from "react";
import { searchUsersAction, addMemberAction } from "@/app/_actions/social";
import { Profile } from "@/modules/profiles/domain/Profile";
import { Loader2, X, Search, UserPlus2, CheckCircle2 } from "lucide-react";

interface AddMemberModalProps {
    groupId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddMemberModal({ groupId, onClose, onSuccess }: AddMemberModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, setIsPending] = useState<string | null>(null);
    const [addedIds, setAddedIds] = useState<string[]>([]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                const users = await searchUsersAction(query);
                setResults(users);
                setIsSearching(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleAdd = async (userId: string) => {
        setIsPending(userId);
        try {
            const result = await addMemberAction(groupId, userId);
            if (result.success) {
                setAddedIds([...addedIds, userId]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPending(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Añadir Miembro</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por usuario o nombre..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px] pr-1 scrollbar-thin">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <p className="text-xs">Buscando...</p>
                        </div>
                    ) : results.length > 0 ? (
                        results.map((user) => {
                            const isAdded = addedIds.includes(user.id);
                            return (
                                <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden border bg-background">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-brand-primary/10 text-brand-primary">
                                                    {user.username?.[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{user.username}</p>
                                            <p className="text-[10px] text-muted-foreground">{user.fullName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(user.id)}
                                        disabled={isPending === user.id || isAdded}
                                        className={`p-2 rounded-lg transition-all ${isAdded ? 'text-green-500' : 'hover:bg-brand-primary/10 text-brand-primary'}`}
                                    >
                                        {isPending === user.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : isAdded ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <UserPlus2 className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    ) : query.length >= 2 ? (
                        <p className="text-center py-10 text-xs text-muted-foreground">No se encontraron usuarios.</p>
                    ) : (
                        <p className="text-center py-10 text-xs text-muted-foreground">Escribe al menos 2 caracteres.</p>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (addedIds.length > 0) onSuccess();
                        onClose();
                    }}
                    className="w-full h-11 rounded-xl bg-brand-primary text-white text-sm font-medium shadow-lg hover:shadow-brand-primary/30 transition-all"
                >
                    Hecho
                </button>
            </div>
        </div>
    );
}
