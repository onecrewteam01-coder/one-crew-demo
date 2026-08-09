import * as fs from "fs";
import * as path from "path";
import yaml from "js-yaml";
import { StructuredPrompt } from "./buildSystemPrompt";

export function loadPrompt(
  promptName: string
): StructuredPrompt {
  const filePath = path.join(
    __dirname,
    `${promptName}.yaml`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Prompt file not found: ${filePath}`
    );
  }

  const fileContent = fs.readFileSync(
    filePath,
    "utf8"
  );

  const prompt = yaml.load(fileContent) as StructuredPrompt;

  if (!prompt) {
    throw new Error(
      `Failed to load prompt: ${promptName}`
    );
  }

  return prompt;
}