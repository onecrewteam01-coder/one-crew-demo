import * as fs from "fs/promises";

import { ingestDocument } from "./ingest";
import { retrieveContext } from "./retrieveContext";

import { runRAG } from "../llm/rag";

async function main() {

  const document =
    await fs.readFile(
      "../One-Crew/ai/knowledge-base/gst.md",
      "utf-8"
    );

  await ingestDocument(document);

  const context =
    await retrieveContext(
      "Do I need GST registration?"
    );

  const answer =
    await runRAG(
      "Do I need GST registration?",
      context
    );

  console.log(answer);
}

main();