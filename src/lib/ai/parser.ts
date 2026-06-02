// ================================================================
// AI Response Parser — Zod Validation
// ================================================================

import { z } from 'zod';

const PlanItemSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  url: z.string().optional(),
  audience_size: z.string().optional(),
  angle: z.string().default(''),
  template_title: z.string().optional(),
  template_body: z.string().optional(),
});

export const PlanResponseSchema = z.object({
  channels: z.object({
    reddit: z.array(PlanItemSchema).default([]),
    facebook: z.array(PlanItemSchema).default([]),
    twitter: z.array(PlanItemSchema).default([]),
    newsletter: z.array(PlanItemSchema).default([]),
    directory: z.array(PlanItemSchema).default([]),
    linkedin: z.array(PlanItemSchema).default([]),
  }),
  quickWins: z.array(z.string()).default([]),
  producthuntChecklist: z.array(z.string()).default([]),
});

export type PlanResponse = z.infer<typeof PlanResponseSchema>;

/**
 * Parse and validate AI response JSON.
 * Attempts to extract JSON from the response even if wrapped in markdown code fences.
 */
export function parseAIResponse(rawText: string): PlanResponse {
  // Remove markdown code fences if present
  let cleaned = rawText.trim();

  // Remove ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Try to find JSON object
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  const parsed = JSON.parse(cleaned);
  return PlanResponseSchema.parse(parsed);
}
