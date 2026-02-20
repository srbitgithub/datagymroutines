'use client';

import { useState } from "react";
import { Loader2, Crown } from "lucide-react";

interface Member {
    id: string;
    username: string;
    avatarUrl?: string | null;
    fullName?: string | null;
}

interface SelectSuccessorModalProps {
    members: Member[];
    onConfirm: (successorId: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

export function SelectSuccessorModal({ members, onConfirm, onClose, isLoading }: SelectSuccessorModalProps) {
    const [selectedId, setSelectedId] = useState<string>("");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="space-y-2 mb-6">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="h-7 w-7 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight text-center">Designar Sucesor</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        Antes de abandonar el grupo, elige quién será el nuevo administrador.
                    </p>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {members.map((member) => (
                        <button
                            key={member.id}
                            onClick={() => setSelectedId(member.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                selectedId === member.id
                                    ? "border-brand-primary bg-brand-primary/10"
                                    : "border-border hover:border-brand-primary/40 hover:bg-muted/50"
                            }`}
                        >
                            <div className="h-9 w-9 rounded-full overflow-hidden border bg-background flex-shrink-0 relative">
                                {member.avatarUrl ? (
                                    <img src={member.avatarUrl} alt={member.username} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                                        {member.username?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{member.username}</p>
                                {member.fullName && (
                                    <p className="text-xs text-muted-foreground truncate">{member.fullName}</p>
                                )}
                            </div>
                            {selectedId === member.id && (
                                <div className="ml-auto h-4 w-4 rounded-full bg-brand-primary flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="py-4 bg-muted hover:bg-muted/80 text-foreground font-black rounded-2xl transition-all uppercase text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => selectedId && onConfirm(selectedId)}
                        disabled={!selectedId || isLoading}
                        className="py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl transition-all uppercase text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Abandonar"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
