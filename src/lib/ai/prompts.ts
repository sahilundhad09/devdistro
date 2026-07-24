// ================================================================
// AI Prompt Builder
// ================================================================

import type { ProjectMode } from '@/types';
import { SEED_DATA } from './seed-data';

const SYSTEM_PROMPT = `You are an elite distribution strategist for indie developers and solopreneurs.
You generate hyper-specific, actionable distribution plans — not generic marketing advice.

CRITICAL RULES FOR TEMPLATES:
1. template_body MUST be 150-300 words minimum. Short templates are UNACCEPTABLE.
2. Reddit posts: Write a full, compelling post as if you're actually the founder. Include a personal story or hook, what problem you solved, how you built it, and end with a soft CTA or question. NO promotional language.
3. Newsletter pitches: Write a complete, professional pitch email with subject, greeting, value hook, specific why-this-newsletter angle, what readers get, and a call to action. 120+ words.
4. LinkedIn posts: Write a full post with hook line, 3-4 paragraphs with line breaks for readability, relevant hashtags. 150+ words.
5. Twitter/X threads: Write the full opening tweet PLUS 3-4 follow-up thread tweets numbered 1/, 2/, 3/, etc.
6. Every subreddit, group, and newsletter MUST be real and currently active
7. Use the SEED DATA provided as your primary source — you may add others you're confident exist
8. Tailor every message template to match the specific community's tone and rules
9. Include specific posting times when relevant (e.g. "Post Tuesday 9am EST when community is most active")
10. For freelancer mode, focus on where potential CLIENTS hang out, not other freelancers
11. angle field: be specific — "Share your launch story with focus on the technical challenges you solved, mention the stack, and ask for feedback on the pricing model" not just "share your story"

Return ONLY valid JSON matching the provided schema. No markdown, no explanations, no code fences.`;

const RESPONSE_SCHEMA = `{
  "channels": {
    "reddit": [
      {
        "title": "subreddit name (e.g., r/SideProject)",
        "description": "Why this subreddit is relevant and its community culture",
        "url": "https://reddit.com/r/...",
        "audience_size": "e.g., 450K members",
        "angle": "Specific, detailed angle/approach — at least 2 sentences explaining exactly what story to tell and why it fits this community",
        "template_title": "Ready-to-use post title (compelling, not clickbait)",
        "template_body": "Full, ready-to-post body (150-300 words). Start with a personal hook, share the journey or problem, describe the solution naturally, end with a question or soft invite. NO promotional tone. Write it as the founder would naturally post."
      }
    ],
    "facebook": [
      {
        "title": "Group name",
        "description": "What the group covers and why it's relevant",
        "url": "https://facebook.com/groups/...",
        "audience_size": "member count",
        "angle": "Specific angle for this group's culture and rules",
        "template_title": "Post title or hook",
        "template_body": "Full post body (120-200 words). Friendly, conversational tone appropriate for Facebook groups. Value-first, ends with engagement question."
      }
    ],
    "twitter": [
      {
        "title": "Strategy name or hashtag",
        "description": "Why this Twitter/X strategy works for this product",
        "url": "optional search or hashtag URL",
        "audience_size": "estimated reach",
        "angle": "Specific content angle and timing strategy",
        "template_title": "Thread hook (first tweet)",
        "template_body": "Full thread: write the hook tweet, then 3-4 numbered follow-up tweets (1/ 2/ 3/ 4/) that tell a complete story. Each tweet under 280 chars. Total 5 tweets minimum."
      }
    ],
    "newsletter": [
      {
        "title": "Newsletter name",
        "description": "What they cover, their audience size, and why they'd feature this",
        "url": "Newsletter URL or submission/contact page",
        "audience_size": "subscriber count if known",
        "angle": "Specific pitch angle — what unique value does this bring to their readers, why now",
        "template_title": "Email subject line for pitch",
        "template_body": "Full email pitch (120-180 words): greeting, personalized hook about their newsletter, value proposition for their readers, what you're offering (demo? exclusive discount? guest post?), soft CTA. Professional but human tone."
      }
    ],
    "directory": [
      {
        "title": "Directory name",
        "description": "What the directory is, its audience, and monthly traffic estimate",
        "url": "Direct submission URL (the actual form/submit page, not homepage)",
        "audience_size": "Monthly visitors or listings count",
        "angle": "How to optimize the listing — what keywords to use, what category to pick, what makes a strong description"
      }
    ],
    "linkedin": [
      {
        "title": "Content strategy or post type",
        "description": "Why this LinkedIn strategy works for this audience",
        "angle": "Specific content angle — target job titles, industries, pain points to address",
        "template_title": "Post hook (first line, stops scroll)",
        "template_body": "Full LinkedIn post (150-250 words): punchy hook line, 3-4 short paragraphs with line breaks, personal insight or data, specific value, end with a question or CTA. Add 5-8 relevant hashtags at the end."
      }
    ]
  },
  "quickWins": [
    "Specific actionable thing with exact steps — e.g. 'Go to r/SideProject right now, sort by Hot, find a post with 50+ comments from this week, leave a genuinely helpful comment mentioning how DevDistro helped you solve a similar problem. Do NOT mention the URL — just the name.'"
  ],
  "producthuntChecklist": ["Step-by-step Product Hunt launch prep with specific details"]
}`;

export function buildPrompt(
  title: string,
  description: string,
  targetAudience: string,
  scrapedContent: string | null,
  mode: ProjectMode
): { system: string; user: string } {
  // Filter seed data based on keywords from target audience
  const keywords = targetAudience.toLowerCase().split(/[\s,]+/);
  const relevantSeed = filterSeedData(keywords, mode);

  const userPrompt = `
PROJECT DETAILS:
- Name: ${title}
- Mode: ${mode === 'freelance' ? 'Freelance Service (find CLIENTS, not other freelancers)' : 'App/Product'}
- Description: ${description}
- Target Audience: ${targetAudience}
${scrapedContent ? `\nLANDING PAGE CONTENT:\n${scrapedContent}\n` : ''}

SEED DATA (use these as primary sources, add others you're confident exist):
${JSON.stringify(relevantSeed, null, 2)}

Generate a comprehensive distribution plan with:
- 8-10 Reddit subreddits (each with a FULL 150-300 word template_body)
- 5-8 Facebook groups (each with a FULL 120-200 word template_body)
- 4-5 Twitter/X strategies (each with a full thread of 5 tweets)
- 3-5 newsletters to pitch (each with a FULL 120-180 word email pitch)
- 10+ directories to submit to (with DIRECT submission links, not homepages)
- 3-5 LinkedIn strategies (each with a FULL 150-250 word post)
- 5 quick wins (very specific, step-by-step, actionable in 30 minutes)
${mode === 'app' ? '- Product Hunt launch checklist (6-8 specific, actionable steps)' : '- 5 client acquisition quick wins instead of PH checklist'}

REMEMBER: template_body fields must be 150-300 words. Short templates are rejected.

RESPONSE SCHEMA:
${RESPONSE_SCHEMA}

Return ONLY the JSON. No markdown fences, no explanations.`;

  return { system: SYSTEM_PROMPT, user: userPrompt };
}

function filterSeedData(keywords: string[], mode: ProjectMode) {
  const result: Record<string, unknown[]> = {
    subreddits: [],
    directories: [],
    newsletters: [],
  };

  // Always include general startup/indie subreddits
  const generalKeywords = ['startup', 'indie', 'saas', 'developer', 'tech', 'build', 'launch'];
  const allKeywords = [...new Set([...keywords, ...generalKeywords])];

  for (const sub of SEED_DATA.subreddits) {
    const tags = sub.tags.map((t: string) => t.toLowerCase());
    if (allKeywords.some(k => tags.some(t => t.includes(k) || k.includes(t)))) {
      result.subreddits.push(sub);
    }
  }

  for (const dir of SEED_DATA.directories) {
    if (mode === 'app' || dir.tags.includes('general')) {
      result.directories.push(dir);
    }
  }

  for (const nl of SEED_DATA.newsletters) {
    const tags = nl.tags.map((t: string) => t.toLowerCase());
    if (allKeywords.some(k => tags.some(t => t.includes(k) || k.includes(t)))) {
      result.newsletters.push(nl);
    }
  }

  // Ensure minimum items
  if (result.subreddits.length < 5) result.subreddits = SEED_DATA.subreddits.slice(0, 10);
  if (result.directories.length < 5) result.directories = SEED_DATA.directories.slice(0, 15);
  if (result.newsletters.length < 3) result.newsletters = SEED_DATA.newsletters.slice(0, 8);

  return result;
}
