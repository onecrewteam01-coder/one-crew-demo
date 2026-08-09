import { groqGenerate } from "./groq";

export async function runRAG(
  question: string,
  context: string
): Promise<string> {

  const prompt = `
Answer ONLY using the supplied context.

Context:
${context}

Question:
${question}
`;

  return await groqGenerate(prompt);
}