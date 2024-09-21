#!/bin/bash

IMAGE_NAME="sssstevenhe/jsphere-vv8-headless:0.0.0"

if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
    echo "$IMAGE_NAME not found. Building before running..."
    docker compose build
fi

mkdir -p target
chmod 777 target

# Run with
# namespaces support on,
# as current user,
# mounting output and
# input directories.
docker run \
    --cap-add=SYS_ADMIN \
    -u "$(id -u)":1000 \
    -v "$(pwd)/target:/home/node/target" \
    -v "$(pwd)/input_urls.txt:/home/node/input_urls.txt" \
    $IMAGE_NAME
