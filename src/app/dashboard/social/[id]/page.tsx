'use client';

import { use, useEffect, useRef, useState } from "react";
import { getGroupByIdAction, exitGroupAction, markGroupNotificationsAsReadAction } from "@/app/_actions/social";
import { getProfileAction } from "@/app/_actions/auth";
import { SocialGroup } from "@/modules/social/domain/SocialGroup";
import { Profile } from "@/modules/profiles/domain/Profile";
import { Loader2, Users2, UserPlus2, LogOut, ChevronLeft, ChevronDown, Crown, History } from "lucide-react";
import Link from "next/link";
import { AddMemberModal } from "@/modules/social/presentation/components/AddMemberModal";
import { GroupActivityFeed } from "@/modules/social/presentation/components/GroupActivityFeed";
import { SelectSuccessorModal } from "@/modules/social/presentation/components/SelectSuccessorModal";
import { useRouter } from "next/navigation";
import { CustomDialog } from "@/components/ui/CustomDialog";

export default function GroupDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const router = useRouter();
    const [group, setGroup] = useState<SocialGroup | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [successorId, setSuccessorId] = useState<string>("");
    const [showSuccessorModal, setShowSuccessorModal] = useState(false);
    const [showMembersPanel, setShowMembersPanel] = useState(false);
    const membersPanelRef = useRef<HTMLDivElement>(null);
    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        type: 'alert' | 'confirm';
        variant: 'info' | 'success' | 'danger' | 'warning';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        type: "alert",
        variant: "info",
        onConfirm: () => { }
    });

    const loadData = async () => {
        setLoading(true);
        const [g, p] = await Promise.all([
            getGroupByIdAction(params.id),
            getProfileAction()
        ]);
        setGroup(g);
        setProfile(p);
        setLoading(false);

        // Mark group notifications as read automatically
        if (g) {
            markGroupNotificationsAsReadAction(params.id);
        }
    };

    useEffect(() => {
        loadData();
    }, [params.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (membersPanelRef.current && !membersPanelRef.current.contains(event.target as Node)) {
                setShowMembersPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleExit = async () => {
        if (!group || !profile) return;

        // If creator and other members exist, show successor selection modal
        if (group.creatorId === profile.id && (group.members?.length || 0) > 1) {
            setShowSuccessorModal(true);
            return;
        }

        setDialogConfig({
            isOpen: true,
            title: "¿Abandonar Grupo?",
            description: "¿Estás seguro de que quieres abandonar este grupo?",
            type: "confirm",
            variant: "danger",
            onConfirm: performExit
        });
    };

    const handleSuccessorConfirm = (selectedId: string) => {
        const selectedSuccessor = group?.members?.find(m => m.id === selectedId);
        setSuccessorId(selectedId);
        setShowSuccessorModal(false);
        setDialogConfig({
            isOpen: true,
            title: "¿Abandonar Grupo?",
            description: `¿Estás seguro de que quieres abandonar este grupo? El usuario "${selectedSuccessor?.username}" pasará a ser el nuevo administrador.`,
            type: "confirm",
            variant: "danger",
            onConfirm: () => performExitWithSuccessor(selectedId)
        });
    };

    const performExitWithSuccessor = async (selectedId: string) => {
        if (!group) return;
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        setIsExiting(true);
        try {
            const result = await exitGroupAction(group.id, selectedId);
            if (result.success) {
                router.push("/dashboard/social");
            } else {
                setDialogConfig({
                    isOpen: true,
                    title: "Error",
                    description: result.error || "Ocurrió un error al intentar salir del grupo",
                    type: "alert",
                    variant: "danger",
                    onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsExiting(false);
        }
    };

    const performExit = async () => {
        if (!group) return;
        setDialogConfig(prev => ({ ...prev, isOpen: false }));
        setIsExiting(true);
        try {
            const result = await exitGroupAction(group.id, successorId || undefined);
            if (result.success) {
                router.push("/dashboard/social");
            } else {
                setDialogConfig({
                    isOpen: true,
                    title: "Error",
                    description: result.error || "Ocurrió un error al intentar salir del grupo",
                    type: "alert",
                    variant: "danger",
                    onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsExiting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="text-center py-20">
                <p className="text-muted-foreground">Grupo no encontrado.</p>
                <Link href="/dashboard/social" className="text-brand-primary hover:underline mt-4 inline-block">
                    Volver a Social
                </Link>
            </div>
        );
    }

    const isCreator = group.creatorId === profile?.id;
    const otherMembers = group.members?.filter(m => m.id !== profile?.id) || [];

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="space-y-4">
                <Link href="/dashboard/social" className="inline-flex items-center text-sm text-muted-foreground hover:text-brand-primary transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    Volver a Social
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm border border-brand-primary/20">
                            <Users2 className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                            <div className="relative" ref={membersPanelRef}>
                                <button
                                    onClick={() => setShowMembersPanel(prev => !prev)}
                                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                                >
                                    <Users2 className="h-3.5 w-3.5" />
                                    {group.members?.length || 0} miembros
                                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showMembersPanel ? 'rotate-180' : ''}`} />
                                </button>

                                {showMembersPanel && (
                                    <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-border bg-card shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                                        <div className="flex items-center gap-2 p-4 border-b bg-muted/10">
                                            <Users2 className="h-4 w-4 text-brand-primary" />
                                            <h3 className="text-sm font-black uppercase tracking-widest">Miembros</h3>
                                        </div>
                                        <div className="divide-y divide-border max-h-72 overflow-y-auto">
                                            {group.members?.map((member) => (
                                                <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                                                    <div className="h-9 w-9 rounded-full overflow-hidden border bg-background flex-shrink-0">
                                                        {member.avatarUrl ? (
                                                            <img src={member.avatarUrl} alt={member.username} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                                                                {member.username?.[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold flex items-center gap-1.5 truncate">
                                                            {member.username}
                                                            {member.id === group.creatorId && (
                                                                <Crown className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                                                            )}
                                                            {member.id === profile?.id && (
                                                                <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full flex-shrink-0">Tú</span>
                                                            )}
                                                        </p>
                                                        {member.fullName && (
                                                            <p className="text-[10px] text-muted-foreground truncate">{member.fullName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCreator && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all hover:-translate-y-0.5"
                            >
                                <UserPlus2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Añadir Miembro</span>
                            </button>
                        )}
                        <button
                            onClick={handleExit}
                            disabled={isExiting}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Abandonar</span>
                        </button>
                    </div>
                </div>
            </header>

            <section className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <History className="h-4 w-4" />
                    <h2 className="text-sm font-bold uppercase tracking-wider">Actividad Reciente</h2>
                </div>
                <GroupActivityFeed groupId={group.id} currentUserId={profile?.id} />
            </section>

            {showSuccessorModal && (
                <SelectSuccessorModal
                    members={otherMembers}
                    onConfirm={handleSuccessorConfirm}
                    onClose={() => setShowSuccessorModal(false)}
                    isLoading={isExiting}
                />
            )}

            {showAddModal && (
                <AddMemberModal
                    groupId={group.id}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        loadData();
                    }}
                />
            )}

            <CustomDialog
                isOpen={dialogConfig.isOpen}
                onClose={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={dialogConfig.onConfirm}
                title={dialogConfig.title}
                description={dialogConfig.description}
                type={dialogConfig.type}
                variant={dialogConfig.variant}
            />
        </div>
    );
}
