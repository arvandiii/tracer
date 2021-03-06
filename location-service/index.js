const express = require("express");
const Promise = require("bluebird");
const bodyParser = require('body-parser')

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
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

const config = { delay: 0 }

app.get("/", async (req, res) => {
  Promise.delay(config.delay).then(() => {
    return res.json({
      city: "Tehran"
    });
  })
});

app.post("/config", (req, res) => {
  config.delay = parseInt(req.body.delay)
  res.json({ delay: config.delay })
})

app.listen(PORT, () => console.log(`location service listening on port ${PORT}`));