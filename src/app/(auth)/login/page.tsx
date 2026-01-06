import { LoginForm } from "@/modules/auth/infrastructure/components/LoginForm";
import { Dumbbell } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-brand-primary/10 p-3">
                        <Dumbbell className="h-6 w-6 text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h1>
                    <p className="text-sm text-muted-foreground text-center">
                        Introduce tus credenciales para acceder a tu cuaderno de fuerza.
                    </p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
}
