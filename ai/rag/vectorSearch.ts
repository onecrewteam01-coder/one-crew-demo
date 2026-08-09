// Nearest-neighbor cosine search over in-memory vectors, returning the top 5 to keep prompt size bounded.
import similarity from "compute-cosine-similarity";

import { createEmbedding } from "./embeddings";
import { vectorStore } from "./ingest";

export async function searchKnowledgeBase(
    query: string
) {

    // Convert the query into vector space once to compare against stored embeddings.
    const queryEmbedding =
        await createEmbedding(query);

    // Map each stored chunk to a score and keep the original text for prompt assembly.
    const scoredResults =
        vectorStore.map(item => ({
            text: item.text,

            score: similarity(
                queryEmbedding,
                item.embedding
            )
        }));

    // Sort descending by similarity so the most relevant chunks appear first; cast to Number for safety.
    scoredResults.sort(
        (a, b) => Number(b.score) - Number(a.score)
    );

    // Return the top 5 results to keep downstream prompt assembly bounded.
    return scoredResults.slice(0, 5);
}