# Agent Prompts

System prompts for the One Crew AI agents, stored as YAML per PRD §6.3
("YAML Prompt Files in GitHub"). One file per agent.

| File | Agent | Owner |
|------|-------|-------|
| `ceo_agent.yaml` | CEO — strategy & decisions | prompts |
| `legal_agent.yaml` | Legal — compliance & contracts | prompts |
| `finance_agent.yaml` | Finance — budgeting & forecasting | prompts |

## File shape

Each YAML has:

- `agent` — short id used by the router / integration layer.
- `name` — human-readable label.
- `model` — target model (currently `gemini`). Prompts are model-agnostic;
  this is just a hint for the integration layer.
- `system` — the full system prompt (the agent's persona, India knowledge,
  guardrails, and output rules).
- `few_shot` — example interactions describing what a good answer must cover.

## The RAG handoff contract  (READ THIS before integrating)

Each `system` prompt ends with a `CONTEXT:` section containing the placeholder:

```
{{retrieved_context}}
```

This is the single integration point with the **RAG pipeline**. At runtime, the
retrieval step must replace `{{retrieved_context}}` with the top-k India-specific
chunks pulled from pgvector **before** the prompt is sent to the model.

- If retrieval returns nothing, replace it with an empty string (or `None found`).
  The prompts already instruct the model not to fabricate facts when context is
  missing.
- **Action items:** the RAG owner + integration owner should agree on the exact
  variable name. If the pipeline uses a different name (e.g. `{context}` or
  `{{context}}`), update these three files to match — keep it consistent across
  all agents.

## Guardrails baked into every prompt (per PRD §8 risk mitigations)

- **No hallucination:** answers must be grounded in `CONTEXT`; the model is told
  not to invent sections, thresholds, dates, or figures.
- **India-only:** no US/Delaware/USD defaults (also a PromptFoo test criterion).
- **Mandatory disclaimers:** Legal and Finance agents must end every response
  with a "consult a CA/CS" disclaimer.
