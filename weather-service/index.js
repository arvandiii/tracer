const express = require("express");
const Promise = require("bluebird")
const bodyParser = require('body-parser')

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
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// Add zipkin express middleware
app.use(zipkinMiddleware({ tracer }));

// Add axios instrumentation
const zipkinAxiosLocation = zipkinInstrumentationAxios(axios, { tracer, serviceName: `ax-${SERVICE_NAME}-location-service` });
const zipkinAxiosWeather = zipkinInstrumentationAxios(axios, { tracer, serviceName: `ax-${SERVICE_NAME}-weather-api` });

const config = { delay: 0 }

const checkResult = (result) => {
  console.log('omade injaaaaaaa', result)
  return new Promise((resolve) => {
    if (result.error || (result.temperature)) {
      return resolve()
    }
    return Promise.delay(10).then(() => {
      return checkResult(result).then(() => { resolve() })
    })
  })
}

app.get("/", async (req, res) => {
  const result = {}

  zipkinAxiosLocation.get(`${LOCATION_SERVICE_ENDPOINT}`).then((response) => {
    console.log('inja 0', response.data)
    const city = response.data.city
    result.temperature = 7
    // zipkinAxiosWeather.get(`http://api.weatherstack.com/current?access_key=818bacc53acaaf66eaeaff671349f901&query=${city}`).then((response) => {
    //   console.log('inja 1', response.data)
    //   result.temperature = response.data.current.temperature
    // }).catch(error => {
    //   console.log('inja 11', error)
    //   result.error = error
    // })
  }).catch(error => {
    console.log('inja 00', error)
    result.error = error
  })
  await checkResult(result)
  console.log('omade inja', config.delay)
  if (result.error) {
    return res.next(error)
  } else {
    Promise.delay(config.delay).then(() => {
      return res.send(result)
    })
  }

});

app.post("/config", (req, res) => {
  config.delay = parseInt(req.body.delay)
  res.json({ delay: config.delay })
})

app.listen(PORT, () => console.log(`weather service listening on port ${PORT}`));