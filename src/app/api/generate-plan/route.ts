// ================================================================
// Generate Plan API Endpoint
// ================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePlan } from '@/lib/ai/generate';
import { FREE_PLAN_LIMIT } from '@/lib/utils/constants';
import { sendPlanReadyEmail } from '@/lib/email/resend';
import { rateLimit } from '@/lib/utils/rate-limit';
import type { ChannelType } from '@/types';


export async function POST(request: Request) {
  try {
    // 1. Rate Limit Check
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitRes = await rateLimit(ip, 5, 3600); // Max 5 plans per hour per IP
    if (!limitRes.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    // Check usage limits
    const { data: profile } = await supabase
      .from('users')
      .select('plan_tier, plans_used_this_month')
      .eq('id', user.id)
      .single();

    if (profile?.plan_tier === 'free' && profile.plans_used_this_month >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        { error: 'You\'ve reached your free plan limit. Upgrade to Pro for unlimited plans.' },
        { status: 402 }
      );
    }

    // Parse request
    const body = await request.json();
    const { title, description, targetAudience, landingUrl, mode, projectId, customScrapedContent } = body;

    if (!title || !description || !targetAudience) {
      return NextResponse.json(
        { error: 'Title, description, and target audience are required.' },
        { status: 400 }
      );
    }

    // Scrape URL if provided
    let scrapedContent: string | null = customScrapedContent || null;
    if (!scrapedContent && landingUrl) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const scrapeRes = await fetch(`${baseUrl}/api/read-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: landingUrl }),
        });
        const scrapeData = await scrapeRes.json();
        if (scrapeData.success) {
          scrapedContent = scrapeData.content;
        }
      } catch {
        // Continue without scraped content
      }
    }

    // Generate plan with AI
    const aiResult = await generatePlan(title, description, targetAudience, scrapedContent, mode);

    // Save project (or use existing)
    let currentProjectId = projectId;

    if (!currentProjectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          description,
          target_audience: targetAudience,
          landing_url: landingUrl || null,
          scraped_content: scrapedContent,
          mode: mode || 'app',
        })
        .select('id')
        .single();

      if (projectError) throw projectError;
      currentProjectId = project.id;
    }

    // Get plan version
    const { count } = await supabase
      .from('plans')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', currentProjectId);

    const version = (count || 0) + 1;

    // Save plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .insert({
        project_id: currentProjectId,
        user_id: user.id,
        quick_wins: aiResult.quickWins,
        producthunt_checklist: aiResult.producthuntChecklist,
        version,
      })
      .select('id')
      .single();

    if (planError) throw planError;

    // Save channels and items
    const channelTypes: ChannelType[] = ['reddit', 'facebook', 'twitter', 'newsletter', 'directory', 'linkedin'];

    for (let i = 0; i < channelTypes.length; i++) {
      const channelType = channelTypes[i];
      const items = aiResult.channels[channelType];

      if (!items || items.length === 0) continue;

      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from('plan_channels')
        .insert({
          plan_id: plan.id,
          channel_type: channelType,
          sort_order: i,
        })
        .select('id')
        .single();

      if (channelError) throw channelError;

      // Create items
      const itemInserts = items.map((item) => ({
        channel_id: channel.id,
        plan_id: plan.id,
        user_id: user.id,
        title: item.title,
        description: item.description || null,
        url: item.url || null,
        audience_size: item.audience_size || null,
        angle: item.angle || null,
        template_title: item.template_title || null,
        template_body: item.template_body || null,
        status: 'pending' as const,
      }));

      const { error: itemsError } = await supabase
        .from('plan_items')
        .insert(itemInserts);

      if (itemsError) throw itemsError;
    }

    // Increment usage counter
    await supabase.rpc('increment_plans_used', { user_id_input: user.id });

    // Send plan ready email notification in the background
    if (user.email) {
      sendPlanReadyEmail(user.email, title, plan.id).catch((err) =>
        console.error('Plan ready email error:', err)
      );
    }

    return NextResponse.json({
      planId: plan.id,
      projectId: currentProjectId,
      channels: aiResult.channels,
      quickWins: aiResult.quickWins,
      producthuntChecklist: aiResult.producthuntChecklist,
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan. Please try again.' },
      { status: 500 }
    );
  }
}

