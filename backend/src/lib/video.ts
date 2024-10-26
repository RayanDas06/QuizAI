import { z } from "zod";
import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

const answerSchema = z.object({
  // the actual text of the mcq choice
  answer: z.string(),
  // an explanation for whether the anwer is correct/incorrect
  explanation: z.string(),
});

export const videoSchema = z.object({
  // db topic this video will be made for
  topic: z.string(),
  // the actual text of the question
  question: z.string(),
  // which one of the 4 possible answers is correct
  correct: z.enum(["a", "b", "c", "d"]),
  answers: z.tuple([answerSchema, answerSchema, answerSchema, answerSchema]),
});

export type Video = z.output<typeof videoSchema>;

export async function sendVideos(videos: Video[]) {
  return await Promise.all(
    videos.map(async (video) => {
      const cmd = new SendMessageCommand({
        QueueUrl: Resource.queue.url,
        MessageBody: JSON.stringify(video),
      });

      const ret = await sqs.send(cmd);
      return ret.MessageId;
    }),
  );
}
