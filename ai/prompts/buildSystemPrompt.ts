// Pure assembler: turns a structured agent prompt (the YAML skeleton) into a
// single system-prompt string for the LLM.
//
// This file intentionally has NO side-effect imports (no LLM client, no fs) so
// it can be unit-tested without an API key, and reused by every agent
// (ceo / legal / developer) to keep prompt formatting consistent.

export interface PromptExample {
  user: string;
  assistant: string;
}

export interface AgentIdentity {
  name: string;
  role: string;
}

export interface PromptTone {
  style?: string;
  personality?: string;
}

/** The shape of a structured prompt YAML file (the boss's skeleton). */
export interface StructuredPrompt {
  agent: AgentIdentity;
  objective?: string;
  responsibilities?: string[];
  capabilities?: string[];
  limitations?: string[];
  tone?: PromptTone;
  response_guidelines?: string[];
  dos?: string[];
  donts?: string[];
  examples?: PromptExample[];
}

function bullets(items?: string[]): string {
  return (items ?? []).map((item) => `- ${item}`).join("\n");
}

function section(title: string, body: string): string {
  return `${title}\n${body}`;
}

/**
 * Compose a structured prompt into a single system-prompt string.
 * Sections are only emitted when their field is present and non-empty, so
 * agents that omit a field (e.g. no examples) still produce clean output.
 */
export function buildSystemPrompt(prompt: StructuredPrompt): string {
  const parts: string[] = [];

  parts.push(`You are ${prompt.agent.name}.`);
  parts.push(`Role: ${prompt.agent.role}`);

  if (prompt.objective && prompt.objective.trim().length > 0) {
    parts.push(section("OBJECTIVE", prompt.objective.trim()));
  }

  if (prompt.responsibilities && prompt.responsibilities.length > 0) {
    parts.push(section("RESPONSIBILITIES", bullets(prompt.responsibilities)));
  }

  if (prompt.capabilities && prompt.capabilities.length > 0) {
    parts.push(section("CAPABILITIES", bullets(prompt.capabilities)));
  }

  if (prompt.limitations && prompt.limitations.length > 0) {
    parts.push(section("LIMITATIONS", bullets(prompt.limitations)));
  }

  if (prompt.tone && (prompt.tone.style || prompt.tone.personality)) {
    const toneLines = [
      prompt.tone.style ? `Style: ${prompt.tone.style}` : "",
      prompt.tone.personality ? `Personality: ${prompt.tone.personality}` : "",
    ].filter((line) => line.length > 0);
    parts.push(section("TONE", toneLines.join("\n")));
  }

  if (prompt.response_guidelines && prompt.response_guidelines.length > 0) {
    parts.push(
      section("RESPONSE GUIDELINES", bullets(prompt.response_guidelines))
    );
  }

  if (prompt.dos && prompt.dos.length > 0) {
    parts.push(section("DO", bullets(prompt.dos)));
  }

  if (prompt.donts && prompt.donts.length > 0) {
    parts.push(section("DON'T", bullets(prompt.donts)));
  }

  if (prompt.examples && prompt.examples.length > 0) {
    const examples = prompt.examples
      .map(
        (ex, i) =>
          `Example ${i + 1}:\nUser: ${ex.user}\nAssistant: ${ex.assistant.trim()}`
      )
      .join("\n\n");
    parts.push(section("EXAMPLES", examples));
  }

  return parts.join("\n\n");
}
