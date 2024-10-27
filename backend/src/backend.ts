import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { sendVideo, videoSchema } from "./lib/video";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { connectToDb, Question, Topic } from "./lib/db";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { generateText, streamObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import sharp from "sharp";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const s3 = new S3Client({});
const model = createAnthropic({ apiKey: Resource.AnthropicKey.value })(
  "claude-3-5-sonnet-latest",
);

await connectToDb();

const app = new Hono();

app.use("*", logger());

app.post("/topic/create", async (c) => {
  const topic = new Topic({
    notesLinks: [],
    questions: [],
  });

  await topic.save();

  console.log({ id: topic.id });

  return c.json({ id: topic.id });
});

app.post("/topic/:id/img", async (c) => {
  const id = c.req.param("id");
  const topic = await Topic.findById(id);
  if (!topic) throw new HTTPException(404, { message: "topic not found" });
  const blob = await c.req.blob();
  console.log(blob);
  async function convertToJpeg(image: string | Buffer): Promise<Buffer> {
    // Ensure image is in Buffer format
    const imageBuffer =
      image instanceof Buffer ? image : Buffer.from(image, "base64");
    // Convert to JPEG using sharp
    return sharp(imageBuffer).jpeg().toBuffer();
  }

  const uuid = crypto.randomUUID();
  const jpeg = await convertToJpeg(Buffer.from(await blob.arrayBuffer()));
  const command = new PutObjectCommand({
    Body: jpeg,
    Key: `${uuid}.jpeg`,
    ContentType: "image/jpeg",
    Bucket: Resource.bucket.name,
  });
  await s3.send(command);
  topic.notesLinks.push(`https://${Resource.bucketURL.url}/${uuid}.jpeg`);
  await topic.save();

  return c.json({});
});

app.post("/topic/:id/commit", async (c) => {
  const id = c.req.param("id");
  const topic = await Topic.findById(id);
  if (!topic) throw new HTTPException(404, { message: "topic not found" });
  if (topic.notesLinks.length === 0) throw new HTTPException(400);

  const { elementStream } = await streamObject({
    model,
    maxTokens: 8192,
    schema: videoSchema,
    output: "array",
    messages: [
      {
        role: "system",
        content: `quiz questions for the passed in notes images. Each question should have 4 multiple choice answers, and only one of these should be the correct answer. Indicate which one of these is correct with the \`correct\` field in the output, by choosing "a" "b" "c" or "d" based on the index of the correct answer. these answers should have an explanation for if they're correct or not. you should generate 3 questions for every image that is passed in, which means you should generate ${topic.notesLinks.length * 3} in total.`,
      },
      {
        role: "user",
        content: topic.notesLinks.map((l) => ({
          type: "image" as const,
          image: l as string,
        })),
      },
    ],
  });

  for await (const video of elementStream) {
    console.log(video);
    await sendVideo(video, topic.id);
  }

  return c.json({ done: true });
});

app.get("/topic/:id", async (c) => {
  const id = c.req.param("id");
  const topic = await Topic.findById(id).populate("questions");
  if (!topic) throw new HTTPException(404, { message: "topic not found" });

  return c.json({ questions: topic.questions.toObject() });
});

app.post(
  "/topic/:topic/:question/chat",
  zValidator(
    "json",
    z.object({
      chosenQuestion: z.enum(["a", "b", "c", "d"]),
      question: z.string(),
    }),
  ),
  async (c) => {
    const [topic, dbQuestion] = await Promise.all([
      await Topic.findById(c.req.param("topic")),
      await Question.findById(c.req.param("question")),
    ]);
    console.log({ topic, dbQuestion });
    if (!dbQuestion || !topic) {
      throw new HTTPException(404, { message: "question/topic not found" });
    }
    const { chosenQuestion, question } = c.req.valid("json");

    const correctIndex = { a: 0, b: 1, c: 2, d: 3 }[dbQuestion.answer];

    const a = dbQuestion.answers
      .map(
        (a, i) =>
          `The actual answer for ${["a", "b", "c", "d"][i]} is "${a.answer}". This is the ${i === correctIndex ? "correct" : "incorrect"} answer`,
      )
      .join(", ");

    const resp = await generateText({
      model,
      maxTokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping explain the answers to a quiz question. The question text is ${dbQuestion.text}. There are 4 possible answers: ${a}. The user chose answer ${chosenQuestion} and asked the question "${question}." Answer the question using the provided images of their notes for assistance`,
        },
        {
          role: "user",
          content: topic.notesLinks.map((l) => ({
            type: "image" as const,
            image: l as string,
          })),
        },
      ],
    });

    return c.text(resp.text);
  },
);

app.get("/", (c) => c.text("hello world"));

export const handler = handle(app);
