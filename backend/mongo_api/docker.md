docker login educai.azurecr.io  
docker buildx install  
docker buildx create --use  
docker buildx build --platform linux/amd64 -t educai.azurecr.io/azurecontainerappsdemo:latest --output type=docker .
docker push educai.azurecr.io/azurecontainerappsdemo:latest
