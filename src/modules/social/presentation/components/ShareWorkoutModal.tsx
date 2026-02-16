'use client';

import { useState, useEffect } from "react";
import { getUserGroupsAction, shareWorkoutAction } from "@/app/_actions/social";
import { SocialGroup } from "@/modules/social/domain/SocialGroup";
import { Loader2, X, Check, Users2, Send } from "lucide-react";

interface ShareWorkoutModalProps {
    sessionId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function ShareWorkoutModal({ sessionId, onClose, onSuccess }: ShareWorkoutModalProps) {
    const [groups, setGroups] = useState<SocialGroup[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const loadGroups = async () => {
            const userGroups = await getUserGroupsAction();
            setGroups(userGroups);
            setLoading(false);
        };
        loadGroups();
    }, []);

    const toggleGroup = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleShare = async () => {
        if (selectedIds.length === 0) return;
        setIsSharing(true);
        try {
            const result = await shareWorkoutAction(sessionId, selectedIds);
            if (result.success) {
                onSuccess();
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                            <Send className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Compartir Entreno</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        ¡Enhorabuena! Selecciona en qué grupos quieres compartir tu gran trabajo de hoy.
                    </p>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-primary/50" />
                            </div>
                        ) : groups.length > 0 ? (
                            groups.map((group) => {
                                const isSelected = selectedIds.includes(group.id);
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => toggleGroup(group.id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                                ? 'border-brand-primary bg-brand-primary/5 shadow-inner'
                                                : 'border-border bg-muted/20 hover:border-brand-primary/30 hover:bg-muted/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 text-left">
                                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                                <Users2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{group.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{group.members?.length || 0} miembros</p>
                                            </div>
                                        </div>
                                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-primary border-brand-primary' : 'border-muted-foreground/30'
                                            }`}>
                                            {isSelected && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-center py-10 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                                No perteneces a ningún grupo social todavía.
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Ahora no
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isSharing || selectedIds.length === 0}
                        className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-medium shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all disabled:opacity-50"
                    >
                        {isSharing ? (
                            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        ) : (
                            "Compartir"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
