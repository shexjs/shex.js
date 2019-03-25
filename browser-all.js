#!/usr/bin/env node

const fs = require('fs')
const glob = require('glob')
const browserify = require("browserify")

const packageGlobs = JSON.parse(
  fs.readFileSync(__dirname + '/lerna.json', 'utf-8')
).packages.filter(
  glob => glob !== "."
)
const directories = packageGlobs.reduce(
  (list, path) => list.concat(glob.glob.sync(path)), []
).filter(dir => dir.indexOf('cli') === -1)

// https://github.com/browserify/browserify-handbook#using-the-api-directly
const res = directories.map(dir => {
  const baseName =  // Could drag it out of package.json but so far we're pretty consistent about reusing the directory name.
        dir.substr(dir.lastIndexOf('/') + 1)
  const fullPath = dir + '/' + baseName + '.js'
  console.log(fullPath)
  let os = fs.createWriteStream(dir + '/browser/' + baseName + '-browserify.js')
  let b = browserify(fullPath, {standalone: baseName}).bundle()
  b.on('error', console.error)
  b.pipe(os)
})
