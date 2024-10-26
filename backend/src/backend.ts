import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { sendVideos } from "./lib/video";

const anthropicKey = Resource.AnthropicKey.value;

const app = new Hono();

app.get("/testVideo", async (c) => {
  await sendVideos(
    [
      {
        question:
          "A researcher is studying infant development and observes that babies first gain control of their head movements, then their torso, and finally their legs. Which developmental principle best explains this pattern?",
        correct: "c",
        answers: [
          {
            answer: "Object Permanence",
            explanation:
              "Object permanence refers to understanding that objects continue to exist even when they can't be seen. This concept doesn't relate to the pattern of physical development described in the question.",
          },
          {
            answer: "Proximodistal Rule",
            explanation:
              "The proximodistal rule describes development from the center of the body outward to the extremities. While this is an important developmental principle, it doesn't explain the head-to-toe pattern described.",
          },
          {
            answer: "Cephalocaudal Rule",
            explanation:
              "Correct! The cephalocaudal rule states that motor development proceeds from top (head) to bottom (feet). This perfectly explains why infants first gain control of their head movements, then torso, and finally their legs.",
          },
          {
            answer: "Myelination Process",
            explanation:
              "While myelination (the development of insulating sheaths around neurons) is important for neural development, it isn't specifically responsible for the head-to-toe pattern of motor development described.",
          },
        ],
      },
    ],
    "671d474b6472ec9fba2b1136",
  );

  return c.text("sent");
});

app.get("/", (c) => {
  return c.text("hello world!");
});

export const handler = handle(app);
