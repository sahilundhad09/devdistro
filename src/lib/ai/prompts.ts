// ================================================================
// AI Prompt Builder
// ================================================================

import type { ProjectMode } from '@/types';
import { SEED_DATA } from './seed-data';

const SYSTEM_PROMPT = `You are an elite distribution strategist for indie developers and solopreneurs. Generate hyper-specific, actionable distribution plans.

═══ CRITICAL REDDIT RULES (most important) ═══
Every subreddit has a postingRules field — you MUST follow it exactly for that community.
GENERAL Reddit rules that apply everywhere:
- NEVER write "check out my app", "link in bio", "DM me" or any call to action that feels promotional
- NEVER include your product URL in the post body (it gets auto-removed by Reddit spam filters)
- Write as a genuine human sharing a story or asking for help, not as a marketer
- The product name can be mentioned naturally 1-2 times — no more
- End with a genuine question to invite discussion, never with "try it free" or similar
- Safe formats: "I built X because I had problem Y, here's what I learned", milestone posts ("launched 3 months ago, here's what happened"), lesson-learned posts
- Unsafe formats: "I made X, give it a try!", product feature lists, anything resembling a landing page

═══ FACEBOOK GROUP RULES ═══
- ONLY use Facebook groups from the SEED DATA — do NOT invent groups
- Use the exact group URL from seed data
- Friendly, helpful tone — Facebook groups allow more direct mentions than Reddit
- Always lead with a question or insight before mentioning your product

═══ TEMPLATE LENGTH (strictly enforced) ═══
- Reddit template_body: 150-250 words. Story format. First-person. No links.
- Facebook template_body: 100-180 words. Conversational. Can include product name + one link at end.
- Twitter template_body: hook tweet + 3-4 numbered follow-up tweets (1/ 2/ 3/)
- Newsletter template_body: 100-150 word pitch email. Personalized, professional.
- LinkedIn template_body: 150-250 words + 5 relevant hashtags at end.
- angle: 2 specific sentences — exact story angle + why it fits this community's culture.

Return ONLY valid JSON. No markdown fences, no explanations.`;

const RESPONSE_SCHEMA = `{
  "channels": {
    "reddit": [{"title":"r/Name","description":"Community culture and why relevant","url":"https://reddit.com/r/...","audience_size":"Xk members","angle":"2 sentences: exact story angle that fits this community's rules and culture","template_title":"Post title — curiosity-first, not promotional","template_body":"150-250 words. First-person story as founder. Describe the problem, the journey, what you learned. Mention product name once naturally. End with a genuine question. ZERO promotional language. No URLs in body."}],
    "facebook": [{"title":"Group Name","description":"Why this group fits","url":"exact URL from seed data","audience_size":"Xk members","angle":"2 sentences: tone and approach for this group","template_title":"Post hook","template_body":"100-180 words. Friendly and conversational. Lead with a question or insight. Product name mention is fine. One URL at the very end only."}],
    "twitter": [{"title":"Strategy name","description":"Why this works","url":"optional","audience_size":"reach","angle":"content angle + best posting time","template_title":"Hook tweet (first line, stops scroll)","template_body":"Hook tweet\\n\\n1/ First tweet (under 280 chars)\\n\\n2/ Second tweet\\n\\n3/ Third tweet\\n\\n4/ CTA tweet"}],
    "newsletter": [{"title":"Newsletter name","description":"Coverage and audience","url":"contact/submission URL","audience_size":"Xk subscribers","angle":"Why their readers specifically will care","template_title":"Email subject line","template_body":"100-150 word pitch: Hi [Name], opening hook about their newsletter, why this fits their readers, what you offer, simple CTA. Human and concise."}],
    "directory": [{"title":"Directory name","description":"Audience and traffic","url":"direct-submission-url","audience_size":"monthly visitors or listings","angle":"Best category + 3 keywords to use in listing description"}],
    "linkedin": [{"title":"Content strategy","description":"Why this LinkedIn strategy works","angle":"Target job titles and pain points to address","template_title":"First line — pattern interrupt to stop scroll","template_body":"150-250 words: punchy hook, 3-4 short paragraphs, personal insight or data point, CTA. End with: #hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5"}]
  },
  "quickWins": ["Name the exact platform + specific action + why it works — doable in 30 min"],
  "producthuntChecklist": ["Specific step with detail — not generic advice"]
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

  // Compact seed serialization to save input tokens
  const compactSubreddits = (relevantSeed.subreddits as Array<{name:string;members:string;url:string;postingRules:string}>)
    .map(s => `${s.name} (${s.members}) ${s.url} | Rules: ${s.postingRules}`);

  const compactFbGroups = (relevantSeed.facebookGroups as Array<{name:string;members:string;url:string}>)
    .map(g => `${g.name} (${g.members}) ${g.url}`);

  const compactDirectories = (relevantSeed.directories as Array<{name:string;url:string}>)
    .map(d => `${d.name}: ${d.url}`);

  const compactNewsletters = (relevantSeed.newsletters as Array<{name:string;subscribers:string;url:string;description:string}>)
    .map(n => `${n.name} (${n.subscribers}): ${n.url} — ${n.description}`);

  const userPrompt = `PROJECT:
Name: ${title}
Mode: ${mode === 'freelance' ? 'Freelance Service (target CLIENTS, not freelancers)' : 'App/Product'}
Description: ${description}
Target Audience: ${targetAudience}
${scrapedContent ? `\nLANDING PAGE:\n${scrapedContent.slice(0, 1200)}\n` : ''}
SUBREDDITS (with their moderation rules — follow rules exactly):
${compactSubreddits.join('\n')}

FACEBOOK GROUPS (only use these — do not invent groups):
${compactFbGroups.join('\n')}

DIRECTORIES (direct submission links):
${compactDirectories.join('\n')}

NEWSLETTERS:
${compactNewsletters.join('\n')}

GENERATE:
- 8-10 Reddit subreddits (follow each subreddit's rules exactly, no promotional language)
- 5-7 Facebook groups from seed data only (conversational, helpful tone)
- 4-5 Twitter/X strategies (full thread per strategy)
- 3-4 newsletter pitches (full 100-150 word pitch email each)
- 10+ directories (use direct submission URLs from seed data)
- 3-5 LinkedIn strategies (full post + hashtags each)
- 5 quick wins (specific platform + action + why)
${mode === 'app' ? '- 6 Product Hunt launch steps (specific)' : '- 5 client acquisition quick wins'}

SCHEMA:
${RESPONSE_SCHEMA}

Return ONLY the JSON.`;

  return { system: SYSTEM_PROMPT, user: userPrompt };
}

function filterSeedData(keywords: string[], mode: ProjectMode) {
  const result: Record<string, unknown[]> = {
    subreddits: [],
    facebookGroups: [],
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

  for (const grp of (SEED_DATA.facebookGroups || [])) {
    const tags = grp.tags.map((t: string) => t.toLowerCase());
    if (allKeywords.some(k => tags.some(t => t.includes(k) || k.includes(t)))) {
      result.facebookGroups.push(grp);
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

  // Enforce minimums + cap
  if (result.subreddits.length < 5) result.subreddits = SEED_DATA.subreddits.slice(0, 12);
  else result.subreddits = result.subreddits.slice(0, 14);

  if (result.facebookGroups.length < 5) result.facebookGroups = (SEED_DATA.facebookGroups || []).slice(0, 10);
  else result.facebookGroups = result.facebookGroups.slice(0, 12);

  if (result.directories.length < 5) result.directories = SEED_DATA.directories.slice(0, 15);
  else result.directories = result.directories.slice(0, 18);

  if (result.newsletters.length < 3) result.newsletters = SEED_DATA.newsletters.slice(0, 8);
  else result.newsletters = result.newsletters.slice(0, 10);

  return result;
}
