// ================================================================
// Resend Email Helper
// ================================================================

import { Resend } from 'resend';
import { APP_NAME, APP_URL } from '../utils/constants';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail(email: string, name: string) {
  if (!resend) {
    console.warn('Resend key not set. Skipping welcome email.');
    return;
  }


  try {
    await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`, // Replace with verified domain in production
      to: email,
      subject: `Welcome to ${APP_NAME}, ${name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to ${APP_NAME}! 🚀</h2>
          <p>Hi ${name},</p>
          <p>Thanks for signing up! ${APP_NAME} helps you get tailored, actionable distribution plans to get your SaaS, app, or freelance services in front of the right audience.</p>
          <p>Here is what you can do next:</p>
          <ul>
            <li>Create your first project.</li>
            <li>Generate your detailed distribution channels (Reddit, directories, newsletters, etc.).</li>
            <li>Use copy-to-clipboard message templates tailored for each community.</li>
            <li>Check off actions as you execute them using the action tracker.</li>
          </ul>
          <p>Ready to start? <a href="${APP_URL}/new" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Generate Your First Plan</a></p>
          <br />
          <p>Best regards,</p>
          <p>The ${APP_NAME} Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

export async function sendPlanReadyEmail(email: string, projectTitle: string, planId: string) {
  if (!resend) {
    console.warn('Resend key not set. Skipping plan ready email.');
    return;
  }

  try {
    await resend.emails.send({
      from: `${APP_NAME} <notifications@resend.dev>`, // Replace with verified domain in production
      to: email,
      subject: `Your distribution plan for "${projectTitle}" is ready! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Your Plan is Ready! 🎉</h2>
          <p>Great news! We've generated your custom distribution plan for <strong>${projectTitle}</strong>.</p>
          <p>We found relevant subreddits, facebook groups, pitchable newsletters, free directories, and custom-tailored ready-to-use message templates for your exact audience.</p>
          <br />
          <a href="${APP_URL}/plan/${planId}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Distribution Plan</a>
          <br />
          <p>Happy launching!</p>
          <p>The ${APP_NAME} Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send plan ready email:', error);
  }
}
