'use client';

import { useEffect, useState } from "react";
import { getUserGroupsAction } from "@/app/_actions/social";
import { getProfileAction } from "@/app/_actions/auth";
import { SocialGroup } from "@/modules/social/domain/SocialGroup";
import { Profile } from "@/modules/profiles/domain/Profile";
import { Users2, Plus, Loader2, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { CreateGroupModal } from "@/modules/social/presentation/components/CreateGroupModal";

export default function SocialPage() {
    const [groups, setGroups] = useState<SocialGroup[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [userGroups, userProfile] = await Promise.all([
            getUserGroupsAction(),
            getProfileAction()
        ]);
        setGroups(userGroups);
        setProfile(userProfile);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!profile?.isSocialActive) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
                    <Lock className="h-10 w-10 text-brand-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Modo Social Desactivado</h1>
                    <p className="text-muted-foreground">
                        Para participar en grupos y compartir tus entrenamientos, debes activar el modo social en tus ajustes.
                    </p>
                </div>
                <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center justify-center rounded-md bg-brand-primary px-6 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90"
                >
                    Ir a Ajustes
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Social</h1>
                    <p className="text-muted-foreground">Gestiona tus grupos y comparte tus logros.</p>
                </div>
                {profile.tier !== 'rookie' && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-brand-primary/90"
                    >
                        <Plus className="h-4 w-4" />
                        Crear Grupo
                    </button>
                )}
            </header>

            {profile.tier === 'rookie' && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex gap-3 text-amber-800 dark:text-amber-200">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <p className="text-sm">
                        Como usuario <strong>Rookie</strong>, no puedes crear grupos, pero puedes ser invitado a grupos existentes por otros usuarios Pro o Elite.
                    </p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <Link
                            key={group.id}
                            href={`/dashboard/social/${group.id}`}
                            className="group relative flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-brand-primary/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="h-12 w-12 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                                    <Users2 className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                                    {group.members?.length || 0} miembros
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mt-2">{group.name}</h3>
                            <p className="text-xs text-muted-foreground">
                                Creado por {group.creatorId === profile.id ? 'ti' : 'un usuario'}
                            </p>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                        <Users2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-4 text-muted-foreground">Aún no perteneces a ningún grupo.</p>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
