const express = require("express");

// Import axios and axios instrumentation
const axios = require("axios");
const zipkinInstrumentationAxios = require("zipkin-instrumentation-axios");

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

// Add axios instrumentation
const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: `axios-client-${SERVICE_NAME}` });


// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

app.get("/auth", async (req, res) => {
  const {pass} = req.body
  try {
    const dateResult = await zipkinAxios.get(`${DATE_SERVICE_ENDPOINT}/time`);
    if (pass)
    res.json({ isAuthorized: true });
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => console.log(`Date service listening on port ${PORT}`));