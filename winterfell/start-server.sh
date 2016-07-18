# Be sure to start the mongodb server on another terminal
# run `mongod`

# Runs the server in this terminal
cd webapp
gulp build
cd ..
node app.js
