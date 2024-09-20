#!/bin/bash

IMAGE_NAME="sssstevenhe/jsphere-vv8-headless:0.0.0"

if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
    echo "$IMAGE_NAME not found. Building before running..."
    docker compose build
fi

docker run --cap-add=SYS_ADMIN \
    -v "$(pwd)/target:/home/node/output" \
    -v "$(pwd)/input_urls.txt:/home/node/input_urls.txt" \
    $IMAGE_NAME
