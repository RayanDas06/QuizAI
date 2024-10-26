import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";

const anthropicKey = Resource.AnthropicKey.value;

const app = new Hono();

app.get("/", (c) => {
  return c.text("hello world!");
});

export const handler = handle(app);
