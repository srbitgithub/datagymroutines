'use client';

import { useState, useEffect, useRef } from "react";
import {
    getUserNotificationsAction,
    markNotificationAsReadAction,
    markAllNotificationsAsReadAction,
    getUnreadNotificationsCountAction
} from "@/app/_actions/social";
import { Notification } from "../../domain/Notification";
import { Bell, BellOff, CheckCircle2, Loader2, MessageSquare, Trophy, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/modules/auth/infrastructure/adapters/SupabaseClient";

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Light poll: only the count (fast, cheap)
    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationsCountAction();
            setUnreadCount(count);
        } catch (error) {
            console.error("Error loading unread count:", error);
        }
    };

    // Full load: notifications list + count (when panel opens)
    const loadNotifications = async () => {
        setLoading(true);
        try {
            const [list, count] = await Promise.all([
                getUserNotificationsAction(),
                getUnreadNotificationsCountAction()
            ]);
            // Only keep unread ones in the local list for the "disappear" behavior
            setNotifications(list.filter(n => !n.isRead));
            setUnreadCount(count);
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load + Real-time + Polling fallback
    useEffect(() => {
        loadUnreadCount();

        // Real-time notifications
        const channel = supabase
            .channel('db-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                async (payload) => {
                    const newNotif = payload.new;

                    // If user is already in the target group, auto-read it
                    const currentGroupId = pathname.split('/').pop();
                    const notifGroupId = newNotif.data?.groupId;

                    if (notifGroupId && currentGroupId === notifGroupId) {
                        try {
                            await markNotificationAsReadAction(newNotif.id);
                            // Feed in GroupActivityFeed will refresh via its own subscription
                        } catch (e) {
                            console.error("Failed to auto-read notification:", e);
                        }
                    } else {
                        // Refresh count for bell
                        loadUnreadCount();
                    }

                    if (isOpen) {
                        loadNotifications();
                    }
                }
            )
            .subscribe();

        const interval = setInterval(loadUnreadCount, 30000); // Polling as backup

        // Refresh when browser tab becomes visible again
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                loadUnreadCount();
                if (isOpen) loadNotifications();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [pathname, isOpen, loadNotifications, loadUnreadCount]); // Added loadNotifications/loadUnreadCount to dependencies for completeness

    // Full fetch when panel opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (n: Notification) => {
        // Optimistic UI update: remove from list and count
        setNotifications(prev => prev.filter(item => item.id !== n.id));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await markNotificationAsReadAction(n.id);

            // Navigate if we have a groupId
            if (n.data?.groupId) {
                const targetPath = `/dashboard/social/${n.data.groupId}`;
                if (pathname === targetPath) {
                    router.refresh();
                } else {
                    router.push(targetPath);
                }
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Error handling notification click:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsReadAction();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'workout_completion': return <Trophy className="h-4 w-4 text-amber-500" />;
            case 'reaction': return <MessageSquare className="h-4 w-4 text-brand-primary" />;
            default: return <User className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getMessage = (n: Notification) => {
        switch (n.type) {
            case 'workout_completion':
                return (
                    <p className="text-sm">
                        <span className="font-bold">@{n.data.username || 'Un usuario'}</span> ha compartido un nuevo entrenamiento.
                    </p>
                );
            case 'reaction':
                return (
                    <p className="text-sm">
                        <span className="font-bold">@{n.data.username || 'Alguien'}</span> ha reaccionado con {n.data.emoji} a tu entrenamiento.
                    </p>
                );
            default:
                return <p className="text-sm">Nueva actividad social.</p>;
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${unreadCount > 0
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary animate-in zoom-in duration-300'
                    : 'bg-muted/30 border-border text-muted-foreground'
                    }`}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-black text-white shadow-lg shadow-brand-primary/30 ring-2 ring-background">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-border bg-card shadow-2xl z-[60] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/10">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Bell className="h-4 w-4 text-brand-primary" />
                            Notificaciones
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-brand-primary flex items-center gap-1 transition-colors"
                            >
                                <CheckCircle2 className="h-3 w-3" />
                                Marcar todo
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 opacity-50">
                                <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-2" />
                                <p className="text-xs font-medium uppercase tracking-widest">Cargando...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-border">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className="relative p-4 transition-colors hover:bg-muted/30 flex gap-4 bg-brand-primary/5 cursor-pointer"
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
                                        <div className="h-10 w-10 shrink-0 rounded-full border bg-background flex items-center justify-center relative shadow-sm">
                                            {n.actor?.avatarUrl ? (
                                                <img src={n.actor.avatarUrl} alt={n.actor.username} className="h-full w-full rounded-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full rounded-full flex items-center justify-center text-xs font-bold bg-muted">
                                                    {n.actor?.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border shadow-sm">
                                                {getIcon(n.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            {getMessage(n)}
                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                                {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 opacity-40">
                                <div className="p-4 rounded-full bg-muted/50">
                                    <BellOff className="h-10 w-10" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest">No hay notificaciones nuevas</p>
                                <p className="text-[10px] font-medium leading-relaxed">
                                    ¡Buen trabajo! Estás al día con tu actividad social.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
