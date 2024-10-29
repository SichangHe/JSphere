# npx serve & # Run this in separate terminal
ADDR=192.168.1.111:3000 # Change this to your IP address and NPX port
docker run -it --network host -v "$(pwd)":/workdir \
    --entrypoint /opt/chromium.org/chromium/chrome \
    --workdir /workdir \
    visiblev8/vv8-base:latest \
    --no-sandbox --headless --screenshot \
    --user-data-dir=/tmp --disable-dev-shm-usage \
    http://$ADDR/index.html
