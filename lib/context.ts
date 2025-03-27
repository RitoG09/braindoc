import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

    const index = pc.Index("chatpdf-rito");

    const queryResult = await index.namespace(convertToAscii(fileKey)).query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error quering embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matching = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matching.filter(
    (match) => match.score && match.score > 0.7
  );

  type MetaData = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map((match) => (match.metadata as MetaData).text);

  return docs.join("\n").substring(0, 3000);
}
