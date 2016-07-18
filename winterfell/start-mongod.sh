lsof -i tcp:27017 | awk 'NR!=1 {print $2}' | xargs kill 
mongod
