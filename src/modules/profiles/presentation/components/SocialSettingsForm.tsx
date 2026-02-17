'use client';

import { useState } from "react";
import { updateSocialSettingsAction } from "@/app/_actions/auth";
import { useTranslation } from "@/core/i18n/TranslationContext";
import { Loader2, Globe, Eye, EyeOff, Users2, Bell, BellOff } from "lucide-react";
import { useProfile } from "@/modules/profiles/presentation/contexts/ProfileContext";

interface SocialSettingsFormProps {
    initialSocialActive?: boolean;
    initialSearchable?: boolean;
    initialNotificationsActive?: boolean;
}

export function SocialSettingsForm({ initialSocialActive = false, initialSearchable = true, initialNotificationsActive = true }: SocialSettingsFormProps) {
    const { t } = useTranslation();
    const { refreshProfile } = useProfile();
    const [isSocialActive, setIsSocialActive] = useState(initialSocialActive);
    const [isSearchable, setIsSearchable] = useState(initialSearchable);
    const [isNotificationsActive, setIsNotificationsActive] = useState(initialNotificationsActive);
    const [isPendingSoc, setIsPendingSoc] = useState(false);
    const [isPendingSea, setIsPendingSea] = useState(false);
    const [isPendingNot, setIsPendingNot] = useState(false);

    const handleToggleSocial = async () => {
        const newValue = !isSocialActive;
        setIsPendingSoc(true);
        try {
            const result = await updateSocialSettingsAction({ isSocialActive: newValue });
            if (result.success) {
                setIsSocialActive(newValue);
                refreshProfile();
            }
        } catch (error) {
            console.error("Failed to update social activity", error);
        } finally {
            setIsPendingSoc(false);
        }
    };

    const handleToggleSearchable = async () => {
        const newValue = !isSearchable;
        setIsPendingSea(true);
        try {
            const result = await updateSocialSettingsAction({ isSearchable: newValue });
            if (result.success) {
                setIsSearchable(newValue);
            }
        } catch (error) {
            console.error("Failed to update searchable status", error);
        } finally {
            setIsPendingSea(false);
        }
    };

    const handleToggleNotifications = async () => {
        const newValue = !isNotificationsActive;
        setIsPendingNot(true);
        try {
            const result = await updateSocialSettingsAction({ isNotificationsActive: newValue });
            if (result.success) {
                setIsNotificationsActive(newValue);
                refreshProfile();
            }
        } catch (error) {
            console.error("Failed to update notifications preference", error);
        } finally {
            setIsPendingNot(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSocialActive ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-muted-foreground'}`}>
                        <Users2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Participar en la red social</p>
                        <p className="text-xs text-muted-foreground">Permite compartir entrenamientos y unirse a grupos.</p>
                    </div>
                </div>
                <button
                    onClick={handleToggleSocial}
                    disabled={isPendingSoc}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${isSocialActive ? 'bg-brand-primary' : 'bg-muted-foreground/30'}`}
                >
                    <span
                        className={`${isSocialActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                    {isPendingSoc && <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-brand-primary" />}
                </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isSearchable ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isSearchable ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Ser visible en búsquedas</p>
                        <p className="text-xs text-muted-foreground">Permite que otros usuarios te encuentren y te inviten a grupos.</p>
                    </div>
                </div>
                <button
                    onClick={handleToggleSearchable}
                    disabled={isPendingSea}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${isSearchable ? 'bg-brand-primary' : 'bg-muted-foreground/30'}`}
                >
                    <span
                        className={`${isSearchable ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                    {isPendingSea && <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-brand-primary" />}
                </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isNotificationsActive ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isNotificationsActive ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium">Notificaciones de actividad</p>
                        <p className="text-xs text-muted-foreground">Recibe alertas cuando alguien reaccione a tus entrenos.</p>
                    </div>
                </div>
                <button
                    onClick={handleToggleNotifications}
                    disabled={isPendingNot}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${isNotificationsActive ? 'bg-brand-primary' : 'bg-muted-foreground/30'}`}
                >
                    <span
                        className={`${isNotificationsActive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                    {isPendingNot && <Loader2 className="absolute -right-6 h-4 w-4 animate-spin text-brand-primary" />}
                </button>
            </div>
        </div>
    );
}
