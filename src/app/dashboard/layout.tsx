import { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell, LayoutDashboard, Settings, LogOut, MapPin, Wrench } from "lucide-react";
import { logoutAction } from "@/app/_actions/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar Mobile (bottom) / Desktop (left) */}
            <aside className="fixed bottom-0 left-0 z-50 w-row border-t bg-zinc-950 md:static md:w-64 md:border-r md:border-t-0">
                <div className="flex h-full flex-row items-center justify-around p-2 md:flex-col md:justify-start md:gap-4 md:p-6">
                    <div className="hidden items-center gap-2 md:flex mb-8">
                        <Dumbbell className="h-6 w-6 text-brand-primary" />
                        <span className="font-bold text-xl tracking-tight">DataGym</span>
                    </div>

                    <nav className="flex w-full flex-row justify-around gap-2 md:flex-col md:justify-start">
                        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden md:inline">Panel principal</span>
                        </Link>
                        <Link href="/dashboard/gyms" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                            <MapPin className="h-4 w-4" />
                            <span className="hidden md:inline">Mis Gimnasios</span>
                        </Link>
                        <Link href="/dashboard/exercises" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                            <Dumbbell className="h-4 w-4" />
                            <span className="hidden md:inline">Ejercicios</span>
                        </Link>
                        <Link href="/dashboard/tools" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                            <Wrench className="h-4 w-4" />
                            <span className="hidden md:inline">Herramientas</span>
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
                            <Settings className="h-4 w-4" />
                            <span className="hidden md:inline">Configuración</span>
                        </Link>
                    </nav>

                    <div className="mt-auto hidden w-full md:block">
                        <form action={logoutAction}>
                            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 cursor-pointer">
                                <LogOut className="h-4 w-4" />
                                <span>Cerrar sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-6 pb-24 md:pb-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
