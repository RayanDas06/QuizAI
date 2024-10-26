import {type Video, videoSchema} from "./video.ts";
import {generateObject} from "ai";
import {createAnthropic} from "@ai-sdk/anthropic";
import {z} from "zod";
import sharp from "sharp";
import fs from "fs";
import {Resource} from "sst";

const anthropicKey = Resource.AnthropicKey.value;

async function convertToJpeg(image: string | Buffer): Promise<Buffer> {
    // Ensure image is in Buffer format
    const imageBuffer = image instanceof Buffer ? image : Buffer.from(image, 'base64');
    // Convert to JPEG using sharp
    return sharp(imageBuffer).jpeg().toBuffer();
}

export async function getQuizQuestions(images: (string | Buffer)[]): Promise<Video[]> {
    const imagesContent = await Promise.all(images.map(async (image) => ({
        type: 'image',
        image: await convertToJpeg(image),
    })));

    const { object } = await generateObject({
        model: createAnthropic({ apiKey: anthropicKey })('claude-3-5-sonnet-latest'),
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
                    ...imagesContent 
                ],
            },
        ],
    });

    console.log(object);
    return object;
}