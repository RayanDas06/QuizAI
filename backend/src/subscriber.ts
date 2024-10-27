import { Resource } from "sst";
import { queueMessage } from "./lib/video";
import Cartesia from "@cartesia/cartesia-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { connectToDb, Question, Topic, type Character } from "./lib/db";

const s3 = new S3Client({});

const cartesia = new Cartesia({
  apiKey: Resource.CartesiaKey.value,
});

export const handler = async (event: { Records: Array<{ body: string }> }) => {
  const { video, topic } = queueMessage.parse(
    JSON.parse(event.Records[0]!.body),
  );

  await connectToDb();
  const t = (await Topic.findById(topic))!;
  t.character;
  // intentionally sequential b/c cartesia has limit
  const questionAudio = await audioFor(
    video.question,
    t.character as Character,
  );
  // maybe later? they're very expensive
  const aAudio = await audioFor(
    video.answers[0].explanation,
    t.character as Character,
  );
  const bAudio = await audioFor(
    video.answers[1].explanation,
    t.character as Character,
  );
  const cAudio = await audioFor(
    video.answers[2].explanation,
    t.character as Character,
  );
  const dAudio = await audioFor(
    video.answers[3].explanation,
    t.character as Character,
  );

  const ids = await Promise.all([
    upload(questionAudio),
    upload(aAudio),
    upload(bAudio),
    upload(cAudio),
    upload(dAudio),
  ]);

  const q = new Question({
    questionAudio: `https://${Resource.bucketURL.url}/${ids[0]}.wav`,
    text: video.question,
    answer: video.correct,
    answers: video.answers.map((a, i) => ({
      ...a,
      answerAudio: `https://${Resource.bucketURL.url}/${ids[i + 1]}.wav`,
    })),
  });

  await q.save();
  t.questions.push(q._id);
  await t.save();
};

const PEOPLE: Record<Character, string> = {
  peter: "d18f25ce-1c39-4bda-95d9-b0d937ff7a11",
  patrick: "257ec57e-bff0-435d-ac75-f1c7f935fdb7",
  sheldon: "c578f5b3-8880-4084-93c6-54dfac6d9956",
};

async function audioFor(text: string, character: Character) {
  return new Uint8Array(
    await cartesia.tts.bytes({
      voice: {
        id: PEOPLE[character],
        mode: "id",
        __experimental_controls: {
          speed: "slow",
        },
      },
      model_id: "sonic-english",
      transcript: text,
      output_format: {
        container: "wav",
        encoding: "pcm_s16le",
        // 44.1 kHz
        sample_rate: 44100,
      },
    }),
  );
}

async function upload(buffer: Uint8Array) {
  const uuid = crypto.randomUUID();
  const command = new PutObjectCommand({
    Key: `${uuid}.wav`,
    Bucket: Resource.bucket.name,
    ContentType: "audio/wav",
    Body: buffer,
  });

  await s3.send(command);

  return uuid;
}

const sleep = (ms: number) =>
  new Promise((res, _) => setTimeout(() => res(undefined), ms));
