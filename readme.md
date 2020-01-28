
# getting started
chmod 755 run.sh
./run.sh

# zipkin
http://localhost:9411

# main-service
http://localhost:3000
## /
type: GET
output: {date, weather, location}
## /config
type: POST
input: {delay}
output: {delay}
## example
curl -d "delay=4000" -X POST http://localhost:3000/config

# date-service
http://localhost:3001
## /
type: GET
output: {date}
## /config
type: POST
input: {delay}
output: {delay}

# location-service
http://localhost:3002
## /
type: GET
output: {location}
## /config
type: POST
input: {delay}
output: {delay}

# weather-service
http://localhost:3003
## /
type: GET
output: {weather, description}
## /config
type: POST
input: {delay}
output: {delay}
