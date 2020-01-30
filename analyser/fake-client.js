const axios = require("axios");
const Promise = require("bluebird")

const run = (result) => {
    return new Promise(async (resolve) => {
        const before = Date.now();
        const { data } = await axios.get('http://localhost:3000')
        console.log('data:', data, 'time:',  Date.now() - before)
        return Promise.delay(1000).then(() => {
            return run(result).then(() => { resolve() })
        })
    })
}

run().then()