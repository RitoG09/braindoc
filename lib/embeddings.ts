import { OpenAIApi, Configuration, ResponseTypes } from "openai-edge";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getEmbeddings(text: string) {
  try {
    const embedding = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    const result = await embedding.json();

    return result.data[0].embedding as number[];
  } catch (error) {
    console.log("error calling openai embedding api", error);
    throw error;
  }
}

// export async function getEmbeddings(text: string) {
//   try {
//     const embedding = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });

//     const result = await embedding.json();

//     console.log("OpenAI Embedding API Response:", result);

//     if (
//       !result ||
//       !result.data ||
//       !Array.isArray(result.data) ||
//       result.data.length === 0 ||
//       !result.data[0]?.embedding
//     ) {
//       throw new Error("Invalid OpenAI response format");
//     }

//     const embeddings = result.data[0].embedding;

//     // console.log("Extracted embeddings:", embeddings);

//     if (
//       !Array.isArray(embeddings) ||
//       embeddings.some((num) => typeof num !== "number")
//     ) {
//       throw new Error("Invalid embeddings: Not a valid numeric array");
//     }

//     return embeddings;
//   } catch (error) {
//     console.log("Error calling OpenAI embedding API:", error);
//     throw error;
//   }
// }
