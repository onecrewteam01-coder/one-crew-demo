// Break long documents into overlapping chunks to preserve local context and avoid splitting concepts across boundaries.
import { RecursiveCharacterTextSplitter }
from "@langchain/textsplitters";

export async function chunkDocument(text:string){

 // LangChain's RecursiveCharacterTextSplitter chosen to balance embedding cost and retrieval granularity.
 const splitter =
 new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
 });

 // Return document objects (with `pageContent`) so downstream code can rely on the splitter's output shape.
 return await splitter.createDocuments([text]);
}