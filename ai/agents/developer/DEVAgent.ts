import { BaseAgent } from "../base";
import { AgentMetadata } from "../../contracts";

export class DEVAgent extends BaseAgent {
  readonly metadata: AgentMetadata = {
    id: "developer",
    name: "Developer Agent",
    promptFile: "developer",
    model: "llama-3.3-70b-versatile",
  };
}