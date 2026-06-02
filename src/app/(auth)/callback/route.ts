// OAuth Callback Route
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/resend';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Send welcome email if brand new user (created_at is within the last 30 seconds)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const signupTime = new Date(user.created_at).getTime();
          const now = Date.now();
          if (now - signupTime < 30000) {
            const name = user.user_metadata?.name || user.email.split('@')[0];
            await sendWelcomeEmail(user.email, name);
          }
        }
      } catch (emailErr) {
        console.error('Welcome email sending error:', emailErr);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

