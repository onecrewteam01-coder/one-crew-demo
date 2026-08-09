import { searchKnowledgeBase } from "./vectorSearch";

// Assemble search results into a prompt-ready context string, separating chunks with blank lines for readability.
export async function retrieveContext(
    query: string
) {
    const results =
        await searchKnowledgeBase(query);

    // Join the top chunks into one string; callers may wrap this with instructions or token-budgeting.
    return results
        .map(result => result.text)
        .join("\n\n");
}