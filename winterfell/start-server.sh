# Runs the server in this terminal
pushd webapp

./../node_modules/gulp/bin/gulp.js build

popd

pushd pdf-filler

java -Ddw.server.applicationConnectors\[0\].port=9797 -jar target/pdf-filler-1.0-SNAPSHOT.jar server config.yaml &

popd

./app.js
