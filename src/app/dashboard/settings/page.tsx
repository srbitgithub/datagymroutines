import { getProfileAction, logoutAction } from "@/app/_actions/auth";
import { User, Settings as SettingsIcon, LogOut, Mail, Weight } from "lucide-react";
import { SupabaseAuthRepository } from "@/modules/auth/infrastructure/adapters/SupabaseAuthRepository";
import { GoalSettingsForm } from "@/modules/profiles/presentation/components/GoalSettingsForm";

export default async function SettingsPage() {
    const profile = await getProfileAction();
    const authRepository = new SupabaseAuthRepository();
    const user = await authRepository.getSession();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Gestiona tu perfil y preferencias de la aplicación.</p>
            </header>

            <div className="grid gap-6">
                <section className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-brand-primary" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Perfil de Usuario</h2>
                            <p className="text-sm text-muted-foreground">{user?.email || 'Cargando...'}</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email de la cuenta
                            </label>
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                {user?.email}
                            </div>
                        </div>

                        {profile && (
                            <>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Nombre de usuario</label>
                                    <div className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-muted/20">
                                        {profile.username || 'No configurado'}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Weight className="h-4 w-4" />
                                        Unidad de peso
                                    </label>
                                    <div className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-muted/20 capitalize">
                                        {profile.weightUnit}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <GoalSettingsForm initialGoal={profile.monthlyGoal || 20} />
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <section className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-red-900 mb-4 flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Zona de Peligro
                    </h2>
                    <p className="text-sm text-red-700 mb-6">
                        Si cierras la sesión tendrás que volver a introducir tus credenciales para acceder a tus datos.
                    </p>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white shadow hover:bg-red-700 h-9 px-4 py-2 cursor-pointer"
                        >
                            Cerrar sesión
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
