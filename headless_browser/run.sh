#!/bin/bash
set -e

if test ! -d "node_modules"; then
    pnpm i --frozen-lockfile
fi

IMAGE_NAME="visiblev8/vv8-base"

mkdir -p target
chmod 777 target

# Run
# as root,
# with namespaces support on,
# mounting current directory at `run/`,
# with `entrypoint.sh` as the entry point,
# removing the container after it exits,
# the VV8 image.
# shellcheck disable=SC2068
docker run \
    --user 0 \
    --cap-add=SYS_ADMIN \
    -v "$(pwd):/home/node/run" \
    --entrypoint "/usr/local/bin/node" \
    --workdir "/home/node/run" \
    --rm \
    $IMAGE_NAME \
    server.js $@
