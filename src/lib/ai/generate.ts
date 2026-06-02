// ================================================================
// AI Generation — Groq API Integration
// ================================================================

import Groq from 'groq-sdk';
import { buildPrompt } from './prompts';
import { parseAIResponse, type PlanResponse } from './parser';
import { AI_MODEL, AI_MAX_TOKENS, AI_TEMPERATURE, AI_MAX_RETRIES } from '@/lib/utils/constants';
import type { ProjectMode } from '@/types';

const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

export async function generatePlan(
  title: string,
  description: string,
  targetAudience: string,
  scrapedContent: string | null,
  mode: ProjectMode
): Promise<PlanResponse> {
  if (!groq) {
    throw new Error('Groq API Key is not configured in environment variables.');
  }

  const { system, user } = buildPrompt(title, description, targetAudience, scrapedContent, mode);

  let lastError: Error | null = null;


  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: AI_MAX_TOKENS,
        temperature: attempt === 0 ? AI_TEMPERATURE : AI_TEMPERATURE - 0.1, // Lower temp on retry
        response_format: { type: 'json_object' },
      });

      const responseText = completion.choices[0]?.message?.content;

      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      const parsed = parseAIResponse(responseText);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`AI generation attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < AI_MAX_RETRIES) {
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`AI generation failed after ${AI_MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}
