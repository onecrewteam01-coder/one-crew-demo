import * as fs from "fs/promises";

import { ingestDocument } from "./ingest";
import { retrieveContext } from "./retrieveContext";

async function main() {

    const document =
        await fs.readFile(
            "./knowledge-base/gst.md",
            "utf-8"
        );

    await ingestDocument(document);

    const retrieved_context =
        await retrieveContext(
            "Do I need GST registration?"
        );

    console.log(
        "RETRIEVED CONTEXT:\n"
    );

    console.log(
        retrieved_context
    );
    const prompt = `
You are a legal compliance advisor.

Answer only using the provided context.

Context:
${retrieved_context}

Question:
Do I need GST registration?
`;

console.log("\nPROMPT:\n");
console.log(prompt);
}

main();