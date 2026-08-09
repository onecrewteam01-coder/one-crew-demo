// Shared types used across the RAG pipeline; keep minimal to keep the pipeline focused.
export interface VectorChunk {
    // Original chunk text corresponding to the vector.
    text: string;
    // Embedding vector produced by the embedding model.
    embedding: number[];
}