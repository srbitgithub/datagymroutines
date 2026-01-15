'use client';

import { useState, useActionState } from 'react';
import { loginAction } from '@/app/_actions/auth';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function LoginForm() {
  const { t } = useTranslation();
  const [state, action, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const isEnvMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <form action={action} className="w-full max-w-sm space-y-6">
      {isEnvMissing && (
        <div className="rounded-md bg-amber-500/10 p-3 text-xs text-amber-600 border border-amber-500/20">
          ⚠️ <strong>{t('auth.env_missing_title')}</strong> {t('auth.env_missing_desc')}
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('auth.email_label')}
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
            {t('auth.password_label')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-brand-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
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
            {t('auth.logging_in')}
          </>
        ) : (
          t('auth.login_button')
        )}
      </button>

      {state?.error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500 animate-in fade-in zoom-in duration-300">
          {state.error}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {t('auth.no_account')}{' '}
        <a href="/register" className="font-medium text-brand-primary hover:underline underline-offset-4">
          {t('auth.register_link')}
        </a>
      </p>
    </form>
  );
}
