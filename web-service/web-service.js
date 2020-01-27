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

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

// Add axios instrumentation
const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: `axios-client-${SERVICE_NAME}` });

// We use pug to render the template
app.set("view engine", "pug");

app.get("/", async (req, res, next) => {
  try {
    const authResult = await zipkinAxios.get(`${AUTH_SERVICE_ENDPOINT}/auth`);
    if (!authResult.data.isAuthorized) {
      throw new Error("NOT_AUTHORIZED")
    }
    const result = await zipkinAxios.get(`${DATE_SERVICE_ENDPOINT}/time`);
    res.render("index", { date: new Date(result.data.currentDate).toLocaleTimeString() });
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => console.log(`Web service listening on port ${PORT}`));