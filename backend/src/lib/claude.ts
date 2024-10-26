import {type Video, videoSchema} from "./video.ts";
import {generateObject} from "ai";
import {createAnthropic} from "@ai-sdk/anthropic";
import {z} from "zod";
import fs from "fs";
import {Resource} from "sst";

const anthropicKey = Resource.AnthropicKey.value;

export async function getQuizQuestions(files: File[]): Promise<Video[]> {
    const { object } = await generateObject({
        model: createAnthropic({apiKey: anthropicKey})('claude-3-5-sonnet-latest'),
        maxTokens: 1024,
        schema: z.array(videoSchema),
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Generate multiple choice questions based on the notes attached.',
                    },
                    {
                        type: 'image',
                        image: fs.readFileSync('../attachments/Iterative Sorting.jpg'),
                    },
                    {
                        type: 'image',
                        image: fs.readFileSync('../attachments/Iterative Sorting 2.jpg'),
                    },
                    {
                        type: 'image',
                        image: fs.readFileSync('../attachments/Iterative Sorting 3.jpg'),
                    },
                ],
            },
        ],
    });

    console.log(object);
    return object;
}