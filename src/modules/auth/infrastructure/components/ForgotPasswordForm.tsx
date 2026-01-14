'use client';

import { useActionState } from 'react';
import { forgotPasswordAction } from '@/app/_actions/auth';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/core/i18n/TranslationContext';

export function ForgotPasswordForm() {
    const { t } = useTranslation();
    const [state, action, isPending] = useActionState(forgotPasswordAction, null);

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
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.sending_reset')}
                    </>
                ) : (
                    t('auth.reset_instructions')
                )}
            </button>

            {state?.error && (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
                    {t('auth.forgot_password_success')}
                </div>
            )}

            <div className="flex justify-center">
                <a href="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    {t('auth.back_to_login')}
                </a>
            </div>
        </form>
    );
}
