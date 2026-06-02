// ================================================================
// Monthly Plan Usage Reset Cron Route
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

    // 2. Perform bulk reset of monthly plans
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('users')
      .update({ plans_used_this_month: 0 })
      .gte('plans_used_this_month', 1); // Only reset if they used at least 1 plan to optimize

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Monthly plan usage limits successfully reset.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Usage reset cron error:', error);
    return NextResponse.json(
      { error: 'Failed to reset plan usage limits' },
      { status: 500 }
    );
  }
}
