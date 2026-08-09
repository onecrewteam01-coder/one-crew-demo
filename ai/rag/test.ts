import { ingestDocument, vectorStore } from "./ingest";
import { searchKnowledgeBase } from "./vectorSearch";

async function main() {

    await ingestDocument(`
GST registration is required above ₹40 lakh turnover.

Startup India provides benefits to recognized startups.

The DPDP Act requires explicit user consent.

MCA registration is mandatory for private limited companies.
`);

    console.log("Chunks:", vectorStore.length);

    console.log(
        await searchKnowledgeBase(
            "GST registration"
        )
    );
}

main();