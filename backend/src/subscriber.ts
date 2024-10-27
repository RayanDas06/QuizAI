import { Resource } from "sst";
import { queueMessage } from "./lib/video";
import Cartesia from "@cartesia/cartesia-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { connectToDb, Question, Topic } from "./lib/db";

const s3 = new S3Client({});

const cartesia = new Cartesia({
  apiKey: Resource.CartesiaKey.value,
});

export const handler = async (event: { Records: Array<{ body: string }> }) => {
  const { video, topic } = queueMessage.parse(
    JSON.parse(event.Records[0]!.body),
  );

  await connectToDb();

  // intentionally sequential b/c cartesia has limit
  const questionAudio = await audioFor(video.question);
  // maybe later? they're very expensive
  // const aAudio = await audioFor(video.answers[0].explanation);
  // const bAudio = await audioFor(video.answers[1].explanation);
  // const cAudio = await audioFor(video.answers[2].explanation);
  // const dAudio = await audioFor(video.answers[3].explanation);

  const questionAudioId = await upload(questionAudio);

  const t = (await Topic.findById(topic))!;
  const q = new Question({
    questionAudio: `https://${Resource.bucketURL.url}/${questionAudioId}.wav`,
    text: video.question,
    answer: video.correct,
    answers: video.answers,
  });

  await q.save();
  t.questions.push(q._id);
  await t.save();
};

const PETER_GRIFFIN = "d18f25ce-1c39-4bda-95d9-b0d937ff7a11";

async function audioFor(text: string) {
  return new Uint8Array(
    await cartesia.tts.bytes({
      voice: {
        id: PETER_GRIFFIN,
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
