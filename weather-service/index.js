const express = require("express");

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT;
const DATE_SERVICE_ENDPOINT = process.env.DATE_SERVICE_ENDPOINT;
const AUTH_SERVICE_ENDPOINT = process.env.AUTH_SERVICE_ENDPOINT;
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

app.get("/time", (req, res) => {
  res.json({
    currentDate: new Date().getTime().toLocaleTimeString()
  });
});

app.listen(PORT, () => console.log(`Date service listening on port ${PORT}`));