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

const topic = new Schema({
  notesLinks: [{ type: String, required: true }],
  videoLinks: [{ type: String, required: true }],
});

export const Topic = model("Topic", topic);
