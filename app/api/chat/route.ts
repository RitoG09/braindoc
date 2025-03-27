import { Message } from "ai";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// export const runtime = "edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(config);

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));

    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;

    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    // Vercel AI docs prompt
    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but the question does not seems to be from the Document".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     prompt,
    //     ...messages.filter((message: Message) => message.role === "user"),
    //   ],
    //   stream: true,
    // });
    let isFirstChunk = true;
    let aiResponse = "";

    const response = streamText({
      model: openai("gpt-3.5-turbo"),
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      onChunk: async ({ chunk }) => {
        // Destructuring directly
        if (isFirstChunk) {
          isFirstChunk = false;
          // Save user message into db
          await db.insert(_messages).values({
            chatId,
            content: lastMessage.content,
            role: "user",
          });
        }

        switch (chunk.type) {
          case "text-delta":
            aiResponse += chunk.textDelta;
            break;
          case "source":
            // Handle source chunk
            break;
          case "tool-call":
            // Handle tool-call chunk
            break;
          default:
            console.warn("Unhandled chunk type:", chunk);
        }
      },
      onFinish: async () => {
        await db.insert(_messages).values({
          chatId,
          content: aiResponse,
          role: "system",
        });
      },
    });

    return response.toTextStreamResponse();

    // const stream = useCompletion({
    //   onResponse: async () => {
    //     await db.insert(_messages).values({
    //       chatId,
    //       content: lastMessage.content,
    //       role: "user",
    //     });
    //   },
    //   onFinish: async (completion) => {
    //     await db.insert(_messages).values({
    //       chatId,
    //       content: completion,
    //       role: "system",
    //     });
    //   },
    // });
  } catch (error) {
    return new Response(`Error occurred: ${error}`, { status: 500 });
  }
}

// const { textStream } = streamText({
//   model: openai('gpt-4-turbo'),
//   prompt: 'Write a poem about embedding models.',
// });
