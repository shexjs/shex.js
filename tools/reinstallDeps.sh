find . -name node_modules -exec rm -rf {} \; ; find . -name package-lock.json -exec rm -rf {} \; ; npx lerna bootstrap && npm install && for d in packages/*; do (cd $d && npm install); done && npm ci
