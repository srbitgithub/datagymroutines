'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/_actions/auth';
import { Mail, Lock, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);
  const isEnvMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <form action={action} className="w-full max-w-sm space-y-6">
      {isEnvMissing && (
        <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 border border-amber-500/20">
          ⚠️ <strong>Configuración incompleta:</strong> Faltan variables de entorno de Supabase en Vercel. Verifica el Dashboard de Vercel.
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="atleta@gym.com"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          "Entrar"
        )}
      </button>

      {state?.error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 animate-in fade-in zoom-in duration-300">
          {state.error}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="font-medium text-brand-primary hover:underline underline-offset-4">
          Regístrate
        </a>
      </p>
    </form>
  );
}
