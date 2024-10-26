/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "videogen",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const queue = new sst.aws.Queue("queue", {});
    const bucket = new sst.aws.Bucket("bucket", {
      access: "public",
    });

    const api = new sst.aws.Function("hono", {
      url: true,
      handler: "src/backend.handler",
    });

    queue.subscribe(
      {
        handler: "src/subscriber.handler",
        link: [bucket],
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
