import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function createEmbedding(
  text: string
): Promise<number[]> {

  const response =
    await axios.post(
      "https://api.jina.ai/v1/embeddings",
      {
        model: "jina-embeddings-v3",
        input: [text]
      },
      {
        headers: {
          Authorization:
            `Bearer ${process.env.JINA_API_KEY}`,
          "Content-Type":
            "application/json"
        }
      }
    );

  return response.data.data[0].embedding;
}