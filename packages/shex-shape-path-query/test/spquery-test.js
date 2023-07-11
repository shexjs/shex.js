"use strict"

const Path = require('path')
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const Sp = require('shape-path-core')

const SpqueryTests = [
  {
    cmd: [
      // script
      '../bin/spquery.js',
      // data
      '-d', Path.join(Sp.examples, 'issue/Issue2.ttl'),
      // ShapeMap
      '-m', '<http://instance.example/project1/Issue2>@<http://project.example/schema#Issue>',
      // ShapePath
      '@<http://project.example/schema#DiscItem>~<http://project.example/ns#href>'
        +',@<http://project.example/schema#Issue>'
        +'~<http://project.example/ns#spec>/valueExpr/shapeExprs'
        +'~<http://project.example/ns#href>',
      // Schema
      Path.join(Sp.examples, 'issue/Issue.json')
    ],
    expected: [
      "http://instance.example/project1/img1.jpg",
      "http://instance.example/project1/spec3"
    ]
  }
]

describe('spquery-test', () => {
  SpqueryTests.forEach(t => {
    it(`$(${render(t.cmd, ' ')}) to equal [${render(t.expected, ', ')}]`, () => {
      const consoleLogs = run.apply(null, t.cmd)
      expect(consoleLogs.length).to.equal(1); // script prints once at end
      const firstCall = JSON.parse(consoleLogs[0].args)
      expect(firstCall).to.deep.equal(t.expected)
    })
  });
});

function render (strings, joiner) {
  return strings.map(s => "'" + s + "'").join(joiner)
}

function run (... command) {
  const exitErrorString = 'process.exit() was called.'
  const logSpy = sinon.stub(console, 'log').callsFake(() => {})
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
