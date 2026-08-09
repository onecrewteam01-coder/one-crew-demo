import { groqGenerate } from "./groq";

export async function runAgent(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {

  const prompt = `
${systemPrompt}

User:
${userPrompt}
`;

  try {
    return await groqGenerate(prompt);
  } catch (error) {
    console.error("Groq Error:", error);
    throw error;
  }
}