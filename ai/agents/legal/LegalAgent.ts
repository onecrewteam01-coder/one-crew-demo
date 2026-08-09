import { BaseAgent } from "../base";
import { AgentMetadata } from "../../contracts";

export class LegalAgent extends BaseAgent {
  readonly metadata: AgentMetadata = {
    id: "legal",
    name: "Legal Agent",
    promptFile: "legal",
    model: "llama-3.3-70b-versatile",
  };
}
