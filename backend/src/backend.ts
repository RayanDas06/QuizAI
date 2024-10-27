import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { sendVideo, videoSchema } from "./lib/video";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { connectToDb, Question, Topic } from "./lib/db";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";
import { generateObject, streamObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import sharp from "sharp";

const s3 = new S3Client({});

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

  const { object } = await generateObject({
    model: createAnthropic({ apiKey: Resource.AnthropicKey.value })(
      "claude-3-5-sonnet-latest",
    ),
    maxTokens: 1024,
    schema: videoSchema,
    output: "array",
    messages: [
      {
        role: "system",
        content: `generate ${topic.notesLinks.length} quiz questions for the passed in notes`,
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

  const videos = await Promise.all(object.map((v) => sendVideo(v, topic.id)));

  return c.json({
    message: `created ${videos.length} quiz questions`,
  });
});

app.get("/topic/:id", async (c) => {
  const id = c.req.param("id");
  const topic = await Topic.findById(id).populate("questions");
  if (!topic) throw new HTTPException(404, { message: "topic not found" });

  return c.json({ questions: topic.questions });
});

app.get("/", (c) => c.text("hello world"));

export const handler = handle(app);
