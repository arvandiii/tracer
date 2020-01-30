const axios = require("axios");
const Promise = require("bluebird")
const express = require("express");
const bodyParser = require('body-parser')
var cors = require('cors')
const PORT = 4000
const _ = require("underscore")

// const run = (result) => {
//     return new Promise(async (resolve) => {
//         const { data } = await axios.get('http://localhost:9411/zipkin/api/v2/traces?limit=10&lookback=60000')
//         console.log('data:', data)
//         return Promise.delay(100).then(() => {
//             return run(result).then(() => { resolve() })
//         })
//     })
// }

// run().then()

const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(cors())
// app.set('view engine', 'ejs');

var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

app.get("/", async (req, res) => {
    const { data: services } = await axios.get('http://localhost:9411/zipkin/api/v2/services')
    const { data: traces } = await axios.get('http://localhost:9411/zipkin/api/v2/traces?limit=50&lookback=60000')

    const result = {}

    _.map(services, (serviceName) => {
        result[serviceName] = []
    })

    _.map(traces, trace => {
        _.map(trace, (span) => {
            result[span.localEndpoint.serviceName].push(
                {
                    x: span.timestamp,
                    y: span.duration
                }
            )
        })
    })


    
    const datasets = _.map(_.keys(result), key => {
        return {
            label: key,
            data: _.sortBy(result[key], "x") ,
            borderColor: dynamicColors(),
        }
    })

    res.json({
        datasets
    });
});

app.listen(PORT, () => console.log(`Date service listening on port ${PORT}`));