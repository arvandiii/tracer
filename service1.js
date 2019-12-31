const express = require("express");

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || "http://localhost:9411";

// Get ourselves a zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: "date-service",
});

const app = express();
const port = process.env.PORT || 3001;

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

app.get("/time", (req, res) => {
  res.json({ currentDate: new Date().getTime() });
});

app.listen(port, () => console.log(`Date service listening on port ${port}`));