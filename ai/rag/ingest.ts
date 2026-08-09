import { chunkDocument } from "./chunker";
import { createEmbedding } from "./embeddings";

import { VectorChunk } from "./types";

// Temporary in-memory vector store for development; replace with a persistent vector DB in production.
export const vectorStore: VectorChunk[] = [];

export async function ingestDocument(
    text: string
) {

    // Break the source document into overlapping chunks so each embedding represents a local context.
    const chunks =
        await chunkDocument(text);

    // Create embeddings sequentially to control request ordering and avoid overwhelming the embedding API.
    for (const chunk of chunks) {

        const embedding =
            await createEmbedding(
                chunk.pageContent
            );

        // Store raw text with its vector so callers can stitch original content back into prompts.
        vectorStore.push({
            text: chunk.pageContent,
            embedding
        });
    }
}