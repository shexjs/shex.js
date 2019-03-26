#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
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
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')))
  const baseName = pkg.main.replace(/\.js$/, '')
  const mainPath = path.join(dir, baseName)
  const outPath = path.join(dir, 'browser', baseName + '-browserify.js')
  console.log(mainPath, "->", outPath)
  let os = fs.createWriteStream(outPath)
  let b = browserify(mainPath, {standalone: path.basename(baseName)}).bundle()
  b.on('error', console.error)
  b.pipe(os)
})
