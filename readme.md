# run docker
docker-compose up --build -d

# zipkin
http://localhost:9411

# web-service
http://localhost:3000

# date-service
http://localhost:3001/time

# deps
web calls auth and date service and date service calls auth

web -> auth -> date
    -> date