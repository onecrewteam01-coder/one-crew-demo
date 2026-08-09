import { groqKeyPool } from "./GroqKeyPool";

function isRateLimitError(error: unknown): boolean {
  const err = error as any;

  const status =
    err?.status ??
    err?.response?.status ??
    err?.cause?.status;

  if (status === 429) {
    return true;
  }

  const message = String(
    err?.message ??
      err?.error?.message ??
      ""
  ).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

function getRetryAfter(error: unknown): number | undefined {
  const err = error as any;

  const retryAfter =
    err?.response?.headers?.["retry-after"] ??
    err?.headers?.["retry-after"];

  if (!retryAfter) {
    return undefined;
  }

  const seconds = Number(retryAfter);

  if (Number.isNaN(seconds)) {
    return undefined;
  }

  return seconds * 1000;
}

export async function groqGenerate(
  systemPrompt: string,
  userPrompt: string,
  model: string
): Promise<string> {
  const maxAttempts = groqKeyPool.totalKeys();

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const state = await groqKeyPool.getClient();

    try {
      const response = await state.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      groqKeyPool.markSuccess(state);

      return response.choices[0]?.message?.content ?? "";
    } catch (error) {
      lastError = error;

      if (isRateLimitError(error)) {
        groqKeyPool.markRateLimited(
          state,
          getRetryAfter(error)
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}