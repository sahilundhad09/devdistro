// ================================================================
// AI Prompt Builder
// ================================================================

import type { ProjectMode } from '@/types';
import { SEED_DATA } from './seed-data';

const SYSTEM_PROMPT = `You are a distribution strategist for indie developers and solopreneurs.
You generate hyper-specific, actionable distribution plans — not generic marketing advice.

RULES:
1. Every subreddit, group, and newsletter MUST be real and currently active
2. Use the SEED DATA provided as your primary source — you may add others you're confident exist
3. Tailor every message template to match the specific community's tone and rules
4. Reddit posts should NOT be promotional — lead with value, story, or problem
5. Include specific posting times when relevant
6. For freelancer mode, focus on where potential CLIENTS hang out, not other freelancers
7. LinkedIn advice should focus on content strategy and engagement, not cold outreach

Return ONLY valid JSON matching the provided schema. No markdown, no explanations, no code fences.`;

const RESPONSE_SCHEMA = `{
  "channels": {
    "reddit": [
      {
        "title": "subreddit name (e.g., r/SideProject)",
        "description": "Why this subreddit is relevant",
        "url": "https://reddit.com/r/...",
        "audience_size": "e.g., 450K members",
        "angle": "What angle/approach to use when posting",
        "template_title": "Ready-to-use post title",
        "template_body": "Ready-to-use post body (value-first, not promotional)"
      }
    ],
    "facebook": [ same structure ],
    "twitter": [
      {
        "title": "Hashtag or account to engage with",
        "description": "Strategy for engagement",
        "url": "optional URL",
        "audience_size": "estimated reach",
        "angle": "Content angle",
        "template_title": "Tweet hook",
        "template_body": "Full tweet or thread starter"
      }
    ],
    "newsletter": [
      {
        "title": "Newsletter name",
        "description": "What they cover and why they'd feature this",
        "url": "Newsletter URL or submission page",
        "audience_size": "subscriber count if known",
        "angle": "Pitch angle",
        "template_title": "Email subject line for pitch",
        "template_body": "Email pitch body"
      }
    ],
    "directory": [
      {
        "title": "Directory name",
        "description": "What the directory is and its audience",
        "url": "Direct submission URL",
        "audience_size": "Monthly traffic estimate if known",
        "angle": "How to optimize listing"
      }
    ],
    "linkedin": [
      {
        "title": "Strategy or content type",
        "description": "Detailed LinkedIn strategy",
        "angle": "Content angle for LinkedIn",
        "template_title": "Post hook",
        "template_body": "Full LinkedIn post"
      }
    ]
  },
  "quickWins": ["3-5 things they can do in the next 30 minutes"],
  "producthuntChecklist": ["Step-by-step Product Hunt launch prep"]
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
- 8-10 Reddit subreddits
- 5-8 Facebook groups
- 5 Twitter/X strategies (hashtags + accounts)
- 3-5 newsletters to pitch
- 10+ directories to submit to (with direct submission links)
- 3-5 LinkedIn strategies
- 3-5 quick wins (things to do in the next 30 minutes)
${mode === 'app' ? '- Product Hunt launch checklist (5-8 steps)' : '- 3-5 client acquisition quick wins instead of PH checklist'}

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
