import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export class AIError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message);
    this.name = 'AIError';
  }
}

/**
 * Generate structured JSON from Google Gemini API with Zod validation and 1x retry.
 * Provider can be configured via GEMINI_API_KEY and AI_MODEL env vars.
 */
export async function generateJson<T>(
  prompt: string,
  zodSchema: z.ZodType<T>
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.AI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new AIError('GEMINI_API_KEY environment variable is not defined.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  let lastError: unknown = null;

  // Try once, retry once on failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error('Empty response received from Gemini API');
      }

      // Parse JSON
      const parsedJson = JSON.parse(responseText);

      // Validate against Zod schema
      const validatedData = zodSchema.parse(parsedJson);
      return validatedData;
    } catch (err) {
      lastError = err;
      if (attempt === 1) {
        // Wait 500ms before retrying once
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  throw new AIError(
    `Failed to generate and validate JSON with Gemini API after 2 attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
    lastError
  );
}
