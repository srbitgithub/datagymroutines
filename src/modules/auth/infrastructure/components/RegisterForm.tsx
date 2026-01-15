'use client';

import { useState, useActionState } from 'react';
import { registerAction } from '@/app/_actions/auth';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function RegisterForm() {
    const { t } = useTranslation();
    const [state, action, isPending] = useActionState(registerAction, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={action} className="w-full max-w-sm space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none">
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
                            className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium leading-none">
                        {t('auth.password_label')}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
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
                        {t('auth.registering')}
                    </>
                ) : (
                    t('auth.register_button')
                )}
            </button>

            {state?.error && (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
                    {t('auth.register_success')}
                </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
                {t('auth.have_account')}{' '}
                <a href="/login" className="font-medium text-brand-primary hover:underline underline-offset-4">
                    {t('auth.login_link')}
                </a>
            </p>
        </form>
    );
}
