"use strict"

const Path = require('path')
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const Sp = require('shape-path-core')

const queryResults = [
  "http://instance.example/project1/img1.jpg",
  "http://instance.example/project1/spec3"
]

describe('spgrep script', () => {
  it('query data', () => {
    const res = run(
      '../bin/spquery.js',
      '-d', Path.join(__dirname, '../examples/issue/Issue2.ttl'),
      '-m', '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>',
      '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>'
        +',@<http://project.example/schema#Issue>'
        +'~<http://project.example/ns#spec>/valueExpr/shapeExprs'
        +'~<http://project.example/ns#href>',
      Path.join(Sp.examples, 'issue/Issue.json')
    )
    const only = res[0].args
    expect(JSON.parse(only)).to.deep.equal([
        "http://instance.example/project1/img1.jpg",
        "http://instance.example/project1/spec3"
    ])
  })
})

function run (... command) {
  const exitErrorString = 'process.exit() was called.'
  const logSpy = sinon.spy(console, 'log')
  const oldExit = process.exit
  let exitCode = null
  process.exit = (exitCodeP) => {
    exitCode = exitCodeP
    throw new Error(exitErrorString)
  };

  const oldArgv = process.argv
  process.argv = [process.argv[0]].concat(command)
  expect(() => {
    process.env._INCLUDE_DEPTH = '0'
    require(command[0])
  }).to.throw(exitErrorString)

  process.argv = oldArgv

  const ret = logSpy.getCalls()
  expect(exitCode).to.equal(0)
  logSpy.restore()
  return ret
}
