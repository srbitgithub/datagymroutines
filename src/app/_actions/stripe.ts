'use server';

import { redirect } from 'next/navigation';
import { stripe } from '@/lib/stripe';
import { SupabaseAuthRepository } from '@/modules/auth/infrastructure/adapters/SupabaseAuthRepository';
import { SupabaseProfileRepository } from '@/modules/profiles/infrastructure/adapters/SupabaseProfileRepository';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function createCheckoutSessionAction(tier: 'pro' | 'elite') {
    const authRepo = new SupabaseAuthRepository();
    const user = await authRepo.getSession();
    if (!user) redirect('/login');

    const profileRepo = new SupabaseProfileRepository();
    const profile = await profileRepo.getById(user.id);
    if (!profile) redirect('/login');

    const priceId = tier === 'pro'
        ? process.env.STRIPE_PRICE_ID_PRO!
        : process.env.STRIPE_PRICE_ID_ELITE!;

    // Get or create Stripe customer
    let customerId = profile.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id },
        });
        customerId = customer.id;
        await profileRepo.update(user.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${APP_URL}/dashboard/settings?success=true`,
        cancel_url: `${APP_URL}/dashboard/settings?canceled=true`,
        metadata: { userId: user.id },
    });

    redirect(session.url!);
}

export async function createCustomerPortalAction() {
    const authRepo = new SupabaseAuthRepository();
    const user = await authRepo.getSession();
    if (!user) redirect('/login');

    const profileRepo = new SupabaseProfileRepository();
    const profile = await profileRepo.getById(user.id);

    if (!profile?.stripeCustomerId) {
        throw new Error('No tienes una suscripción activa.');
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripeCustomerId,
        return_url: `${APP_URL}/dashboard/settings`,
    });

    redirect(portalSession.url);
}
