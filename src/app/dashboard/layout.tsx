import { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell, LayoutDashboard, Settings, LogOut, MapPin, Wrench, PlayCircle } from "lucide-react";
import { logoutAction } from "@/app/_actions/auth";
import { SessionProvider } from "@/modules/training/presentation/contexts/SessionContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <div className="flex min-h-screen bg-background text-foreground">
                {/* Sidebar Mobile (bottom) / Desktop (left) */}
                <aside className="fixed bottom-0 inset-x-0 z-50 border-t bg-zinc-950 md:static md:w-64 md:border-r md:border-t-0">
                    <div className="flex h-full flex-row items-center justify-around p-2 md:flex-col md:justify-start md:gap-4 md:p-6">
                        <div className="hidden items-center gap-2 md:flex mb-8">
                            <Dumbbell className="h-6 w-6 text-brand-primary" />
                            <span className="font-bold text-xl tracking-tight">DataGym</span>
                        </div>

                        <nav className="flex w-full flex-row justify-around gap-2 md:flex-col md:justify-start overflow-x-auto no-scrollbar">
                            <Link href="/dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-accent shrink-0">
                                <LayoutDashboard className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline">Panel</span>
                            </Link>
                            <Link href="/dashboard/session" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-black transition-colors hover:bg-brand-primary/10 text-brand-primary shrink-0">
                                <PlayCircle className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline font-black">Rutina</span>
                            </Link>
                            <Link href="/dashboard/gyms" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-accent shrink-0">
                                <MapPin className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline">Gimnasios</span>
                            </Link>
                            <Link href="/dashboard/exercises" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-accent shrink-0">
                                <Dumbbell className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline">Ejercicios</span>
                            </Link>
                            <Link href="/dashboard/tools" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-accent shrink-0">
                                <Wrench className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline">Herramientas</span>
                            </Link>
                            <Link href="/dashboard/settings" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-[10px] md:text-sm font-medium transition-colors hover:bg-accent shrink-0">
                                <Settings className="h-5 w-5 md:h-4 md:w-4" />
                                <span className="md:inline">Ajustes</span>
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

                <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
