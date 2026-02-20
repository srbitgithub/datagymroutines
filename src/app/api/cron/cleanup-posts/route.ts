import { createAdminClient } from "@/core/infrastructure/SupabaseAdminClient";

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const admin = createAdminClient();
    const { error, count } = await admin
        .from('social_posts')
        .delete({ count: 'exact' })
        .lt('created_at', cutoff.toISOString());

    if (error) {
        console.error('[cron/cleanup-posts]', error.message);
        return Response.json({ error: error.message }, { status: 500 });
    }

    console.log(`[cron/cleanup-posts] Deleted ${count} posts older than ${cutoff.toISOString()}`);
    return Response.json({ deleted: count });
}
