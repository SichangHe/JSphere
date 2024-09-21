#!/bin/bash
set -e

if test ! -d "node_modules"; then
    pnpm i
fi

IMAGE_NAME="visiblev8/vv8-base"

mkdir -p target
chmod 777 target

# Run
# as root,
# with namespaces support on,
# mounting current directory at `run/`,
# with `entrypoint.sh` as the entry point,
# the VV8 image.
docker run \
    --user 0 \
    --cap-add=SYS_ADMIN \
    -v "$(pwd):/home/node/run" \
    --entrypoint "run/entrypoint.sh" \
    $IMAGE_NAME
