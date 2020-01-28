const express = require("express");
const Promise = require("bluebird")
// Import axios and axios instrumentation
const axios = require("axios");
const zipkinInstrumentationAxios = require("zipkin-instrumentation-axios");

// Import zipkin stuff
const { Tracer, ExplicitContext, BatchRecorder, jsonEncoder } = require("zipkin");
const { HttpLogger } = require("zipkin-transport-http");
const zipkinMiddleware = require("zipkin-instrumentation-express").expressMiddleware;

const ZIPKIN_ENDPOINT = process.env.ZIPKIN_ENDPOINT;
const LOCATION_SERVICE_ENDPOINT = process.env.LOCATION_SERVICE_ENDPOINT;
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
const zipkinAxiosLocation = zipkinInstrumentationAxios(axios, { tracer, serviceName: `ax-${SERVICE_NAME}-location-service` });
const zipkinAxiosWeather = zipkinInstrumentationAxios(axios, { tracer, serviceName: `ax-${SERVICE_NAME}-weather-api` });

let delay = 0

app.get("/", async (req, res) => {
  // await Promise.delay(delay)
  try {
    const locationResult = await zipkinAxiosLocation.get(`${LOCATION_SERVICE_ENDPOINT}`);
    const city = locationResult.data.city
    const weatherResult = await zipkinAxiosWeather.get(`http://api.weatherstack.com/current?access_key=818bacc53acaaf66eaeaff671349f901&query=${city}`)
    const temperature = weatherResult.data.current.temperature
    res.json({
      temperature,
    });
  } catch (error) {
    next(error)
  }
});

app.post("/config", async (req, res) => {
  delay = req.body.delay
  res.json({ delay })
})

app.listen(PORT, () => console.log(`weather service listening on port ${PORT}`));