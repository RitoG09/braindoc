import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";
import { hash } from "crypto";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is not set");
}

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

//type console se dekhke define krna
type PDFPage = {
  metadata: {
    loc: { pageNumber: number };
  };
  pageContent: string;
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf (langchain used)
  console.log("downloading s3 into the file system");
  const file_name = await downloadFromS3(fileKey);

  if (!file_name) {
    throw new Error("could not download from S3");
  }

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  if (!pages || pages.length === 0) {
    throw new Error("No pages found in PDF");
  }

  console.log(`PDF Loaded: ${pages.length} pages`);

  // 2. Split and segment the pdf into pages
  const documents = await Promise.all(pages.map(prepareDocument));

  console.log(`Total documents after splitting: ${documents.length}`);

  //3. Vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  console.log(`Total vectors generated: ${vectors.length}`);

  //4. upload to pineconeDB
  const index = pc.Index("chatpdf-rito");
  const namespace = index.namespace(convertToAscii(fileKey));
  console.log("inserting vectors into pinecone....");

  try {
    await namespace.upsert(vectors);
    console.log("vectors: " + vectors.length);
    return documents;
  } catch (error) {
    console.log(`error inserting vectors: %o into pinecone`, vectors, error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    console.log("Embedding values:", embeddings);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord; // Replace 'any' with the correct type if known
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent);
//     console.log("Raw Embedding Values:", embeddings);

//     if (
//       !Array.isArray(embeddings) ||
//       embeddings.length === 0 ||
//       embeddings.some(isNaN)
//     ) {
//       console.log("Embeddings before error:", embeddings);
//       throw new Error("Invalid embeddings: Not a valid numeric array");
//     }

//     const hash = md5(doc.pageContent);
//     return {
//       id: hash,
//       values: embeddings, // This should be an array of numbers
//       metadata: {
//         text: doc.metadata.text,
//         pageNumber: doc.metadata.pageNumber,
//       },
//     } as any;
//   } catch (error) {
//     console.log("Error embedding document:", error);
//     throw error;
//   }
// }

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const allSplits = await textSplitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  console.log(
    `Page ${metadata.loc.pageNumber} split into ${allSplits.length} chunks`
  );
  return allSplits;
}

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, "");
//   // split the docs
//   const splitter = new RecursiveCharacterTextSplitter();
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);
//   return docs;
// }
