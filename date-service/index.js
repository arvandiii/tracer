const express = require("express");
const Promise = require("bluebird");

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT;
const SERVICE_NAME = process.env.SERVICE_NAME;
const PORT = process.env.PORT;

// Get ourselves a zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: SERVICE_NAME,
});
const app = express();

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

let delay = 0

app.get("/", async (req, res) => {
  await Promise.delay(delay)
  res.json({
    time: new Date().getTime()
  });
});

app.post("/config", async (req, res) => {
  delay = req.body.delay
  res.json({ delay })
})

app.listen(PORT, () => console.log(`Date service listening on port ${PORT}`));