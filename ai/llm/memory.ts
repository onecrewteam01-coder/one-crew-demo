import { genAI } from "./client";

export async function extractMemory(
  conversation: string
): Promise<string> {

  const prompt = `
Extract important founder/company facts.

Conversation:
${conversation}

Return concise bullet points.
`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}