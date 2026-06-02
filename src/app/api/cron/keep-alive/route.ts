// ================================================================
// Supabase Keep-Alive Cron Route
// ================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    // 1. Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Perform a simple warm query
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Supabase project kept warm.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Keep-alive cron error:', error);
    return NextResponse.json(
      { error: 'Failed to keep alive Supabase DB' },
      { status: 500 }
    );
  }
}
