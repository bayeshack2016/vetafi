# Runs the server in this terminal
pushd webapp

./../node_modules/gulp/bin/gulp.js build

popd

pm2 start process.json
