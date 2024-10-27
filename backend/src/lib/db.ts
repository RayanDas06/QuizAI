import mongoose, { model, Schema, Types } from "mongoose";
import { Resource } from "sst";

let conn: mongoose.Mongoose | undefined = undefined;

export async function connectToDb() {
  if (conn) {
    return conn;
  } else {
    conn = await mongoose.connect(Resource.MongoURI.value);
  }
}

process.on("SIGINT", async () => {
  console.log("ctrl-c detected, disconnecting from mongoose...");
  await mongoose.disconnect();
  process.exit();
});

const questions = new Schema({
  text: { type: String, required: true },
  questionAudio: { type: String, required: true },
  answer: { type: String, required: true, enum: ["a", "b", "c", "d"] },
  answers: {
    type: [
      {
        // text content of the answer
        answer: { type: String, required: true },
        // explanation for if the question is right or wrong
        explanation: { type: String, required: true },
        // link to audio url
        answerAudio: { type: String, required: true },
      },
    ],
    required: true,
  },
});

const topic = new Schema({
  notesLinks: [{ type: String, required: true }],
  questions: [{ type: Types.ObjectId, ref: "Question", required: true }],
});

export const Topic = model("Topic", topic);
export const Question = model("Question", questions);
