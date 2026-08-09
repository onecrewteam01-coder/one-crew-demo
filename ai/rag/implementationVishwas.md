# Sprint 1 - Vishwas
(Just to know what features have been implemented)

* Implemented the RAG pipeline for context retrieval.
* Added document chunking, embedding generation, ingestion, vector search, and `retrieveContext()` functionality.
* Created test scripts (`test.ts`, `agentTest.ts`) to validate component-level and end-to-end retrieval.
* Added knowledge base ingestion support using markdown documents.
* Current implementation uses an in-memory vector store and is ready for integration with Legal, Finance, and CEO agents via `retrieveContext(userQuery)`.
