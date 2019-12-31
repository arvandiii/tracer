const express = require("express");

// Import axios and axios instrumentation
const axios = require("axios");
const zipkinInstrumentationAxios = require("zipkin-instrumentation-axios");

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT || "http://localhost:9411";
const API_ENDPOINT = process.env.API_ENDPOINT || "http://localhost:3001";

// Get ourselves a zipkin tracer
const tracer = new Tracer({
  ctxImpl: new ExplicitContext(),
  recorder: new BatchRecorder({
    logger: new HttpLogger({
      endpoint: `${ZIPKIN_ENDPOINT}/api/v2/spans`,
      jsonEncoder: jsonEncoder.JSON_V2,
    }),
  }),
  localServiceName: "web-service",
});

const app = express();
const port = process.env.PORT || 3000;

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

// Add axios instrumentation
const zipkinAxios = zipkinInstrumentationAxios(axios, { tracer, serviceName: "axios-client" });

// We use pug to render the template
app.set("view engine", "pug");

app.get("/", async (req, res, next) => {
  try {
    const result = await zipkinAxios.get(`${API_ENDPOINT}/time`);
    res.render("index", { date: new Date(result.data.currentDate).toLocaleTimeString() });
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => console.log(`Web service listening on port ${port}`));