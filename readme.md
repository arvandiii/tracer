# run docker
docker-compose up --build -d

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
