// ================================================================
// AI Prompt Builder
// ================================================================

import type { ProjectMode } from '@/types';
import { SEED_DATA } from './seed-data';

const SYSTEM_PROMPT = `You are an elite distribution strategist for indie developers and solopreneurs. Generate hyper-specific, actionable distribution plans — not generic advice.

TEMPLATE LENGTH RULES (strictly enforced):
- template_body for reddit/facebook/linkedin: 150-300 words minimum. Write as the actual founder. No short replies.
- template_body for newsletter: full pitch email 120-180 words (greeting + hook + why their readers + CTA).
- template_body for twitter: hook tweet PLUS 3-4 numbered follow-up tweets (1/ 2/ 3/).
- angle: 2 sentences minimum — specific story angle + why it fits this community.
- Short templates are REJECTED.

OTHER RULES:
- All subreddits/groups/newsletters must be real and active.
- Reddit posts: value-first, never promotional, end with question or invite.
- Directories: use direct submission URLs, not homepages.
- LinkedIn: include 5-8 hashtags at the end of every post.
- For freelance mode: target where CLIENTS hang out, not other freelancers.

Return ONLY valid JSON. No markdown fences, no explanations.`;

const RESPONSE_SCHEMA = `{
  "channels": {
    "reddit": [{"title":"r/Name","description":"Why relevant","url":"https://reddit.com/r/...","audience_size":"Xk members","angle":"2-sentence specific angle","template_title":"Post title","template_body":"150-300 word post body as the founder, value-first, no promotion, ends with question"}],
    "facebook": [{"title":"Group Name","description":"Why relevant","url":"https://facebook.com/groups/...","audience_size":"Xk members","angle":"2-sentence angle","template_title":"Post hook","template_body":"120-200 word friendly post, value-first, ends with engagement question"}],
    "twitter": [{"title":"Strategy name","description":"Why this works","url":"optional","audience_size":"reach","angle":"content angle + best timing","template_title":"Hook tweet","template_body":"Hook tweet text\\n\\n1/ First tweet (under 280 chars)\\n\\n2/ Second tweet\\n\\n3/ Third tweet\\n\\n4/ Final tweet with CTA"}],
    "newsletter": [{"title":"Newsletter name","description":"Coverage + audience","url":"submission/contact URL","audience_size":"Xk subscribers","angle":"Why their readers care","template_title":"Email subject line","template_body":"120-180 word pitch: greeting + personal hook about their newsletter + value for readers + what you offer + CTA"}],
    "directory": [{"title":"Directory name","description":"Audience + monthly traffic","url":"direct-submission-url.com/submit","audience_size":"monthly visitors","angle":"How to optimize: best category, keywords, description tips"}],
    "linkedin": [{"title":"Content strategy","description":"Why this works","angle":"target job titles + pain points","template_title":"Scroll-stopping first line","template_body":"150-250 word post: punchy hook, 3-4 short paragraphs, personal insight, CTA, then hashtags: #tag1 #tag2 #tag3 #tag4 #tag5"}]
  },
  "quickWins": ["Specific step-by-step action doable in 30 min with exact platform/community named"],
  "producthuntChecklist": ["Specific PH launch step with details"]
}`;

export function buildPrompt(
  title: string,
  description: string,
  targetAudience: string,
  scrapedContent: string | null,
  mode: ProjectMode
): { system: string; user: string } {
  const keywords = targetAudience.toLowerCase().split(/[\s,]+/);
  const relevantSeed = filterSeedData(keywords, mode);

  // Compact seed representation to save tokens
  const compactSeed = {
    subreddits: (relevantSeed.subreddits as Array<{name:string;members:string;url:string}>)
      .map(s => `${s.name} (${s.members}) — ${s.url}`),
    directories: (relevantSeed.directories as Array<{name:string;url:string}>)
      .map(d => `${d.name} — ${d.url}`),
    newsletters: (relevantSeed.newsletters as Array<{name:string;url:string;description:string}>)
      .map(n => `${n.name} — ${n.url} — ${n.description}`),
  };

  const userPrompt = `PROJECT:
Name: ${title}
Mode: ${mode === 'freelance' ? 'Freelance Service (target CLIENTS, not freelancers)' : 'App/Product'}
Description: ${description}
Target Audience: ${targetAudience}
${scrapedContent ? `\nLANDING PAGE:\n${scrapedContent.slice(0, 1500)}\n` : ''}
SEED CHANNELS (use as primary sources, add more you know exist):
Subreddits: ${compactSeed.subreddits.join(' | ')}
Directories: ${compactSeed.directories.join(' | ')}
Newsletters: ${compactSeed.newsletters.join(' | ')}

GENERATE:
- 8-10 Reddit subreddits (each with 150-300 word template_body)
- 5-7 Facebook groups (each with 120-200 word template_body)
- 4-5 Twitter/X strategies (each a 5-tweet thread)
- 3-5 newsletter pitches (each a full 120-180 word email)
- 10+ directories (direct submission URLs only)
- 3-5 LinkedIn posts (each 150-250 words + hashtags)
- 5 quick wins (specific, named platforms, doable in 30 min)
${mode === 'app' ? '- 6-8 Product Hunt launch steps (specific)' : '- 5 client acquisition quick wins'}

SCHEMA:
${RESPONSE_SCHEMA}

Return ONLY the JSON.`;

  return { system: SYSTEM_PROMPT, user: userPrompt };
}

function filterSeedData(keywords: string[], mode: ProjectMode) {
  const result: Record<string, unknown[]> = {
    subreddits: [],
    directories: [],
    newsletters: [],
  };

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

  // Enforce minimums but cap to avoid 413
  if (result.subreddits.length < 5) result.subreddits = SEED_DATA.subreddits.slice(0, 12);
  else result.subreddits = result.subreddits.slice(0, 15);

  if (result.directories.length < 5) result.directories = SEED_DATA.directories.slice(0, 15);
  else result.directories = result.directories.slice(0, 18);

  if (result.newsletters.length < 3) result.newsletters = SEED_DATA.newsletters.slice(0, 8);
  else result.newsletters = result.newsletters.slice(0, 10);

  return result;
}
