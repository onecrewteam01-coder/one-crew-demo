import { genAI } from "./client";

export async function generateText(
  prompt: string
): Promise<string> {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}