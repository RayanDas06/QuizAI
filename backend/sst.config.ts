/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "videogen",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const anthropicKey = new sst.Secret("AnthropicKey");
    const cartesiaKey = new sst.Secret("CartesiaKey");

    const queue = new sst.aws.Queue("queue", {
      visibilityTimeout: "2 minutes",
    });
    const bucket = new sst.aws.Bucket("bucket", {
      access: "public",
    });

    const api = new sst.aws.Function("hono", {
      url: true,
      handler: "src/backend.handler",
      link: [anthropicKey, queue],
    });

    queue.subscribe(
      {
        handler: "src/subscriber.handler",
        link: [bucket, anthropicKey, cartesiaKey],
        memory: "5 GB",
      },
      {
        batch: {
          size: 1,
        },
        transform: {
          eventSourceMapping(args) {
            args.scalingConfig = {
              ...args.scalingConfig,
              // cartesia API has a max of 3
              maximumConcurrency: 3,
            };
          },
        },
      },
    );

    return {
      apiURL: api.url,
    };
  },
});
