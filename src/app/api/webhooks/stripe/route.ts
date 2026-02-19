import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/modules/admin/infrastructure/adapters/SupabaseAdminClient';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getTierFromPriceId(priceId: string): 'pro' | 'elite' | null {
    if (priceId === process.env.STRIPE_PRICE_ID_PRO) return 'pro';
    if (priceId === process.env.STRIPE_PRICE_ID_ELITE) return 'elite';
    return null;
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        switch (event.type) {

            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                if (!userId || !session.subscription || !session.customer) break;

                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                );
                const priceId = subscription.items.data[0]?.price.id;
                const tier = getTierFromPriceId(priceId) ?? 'pro';

                await supabase.from('profiles').update({
                    tier,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    subscription_status: subscription.status,
                }).eq('id', userId);

                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const priceId = subscription.items.data[0]?.price.id;
                const tier = getTierFromPriceId(priceId);
                if (!tier) break;

                await supabase.from('profiles').update({
                    tier,
                    subscription_status: subscription.status,
                }).eq('stripe_subscription_id', subscription.id);

                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                await supabase.from('profiles').update({
                    tier: 'rookie',
                    stripe_subscription_id: null,
                    subscription_status: 'canceled',
                }).eq('stripe_subscription_id', subscription.id);

                break;
            }
        }
    } catch (err: any) {
        console.error('Error processing webhook event:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
