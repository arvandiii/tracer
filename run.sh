echo "====> stoping all containers"
docker stop $(docker ps -a -q)
echo "====> removing all containers"
docker rm $(docker ps -a -q)
echo "====> up"
docker-compose up --build -d
echo "====> ps"
docker ps