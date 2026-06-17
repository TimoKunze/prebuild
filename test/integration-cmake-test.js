const test = require('tape')
const exec = require('child_process').exec
const path = require('path')
const fs = require('fs')

const cwd = path.join(__dirname, 'native-module-cmake')

test('can prebuild a cmake-js native module for node', function (t) {
  fs.rmSync(path.join(cwd, 'prebuilds'), { recursive: true, force: true })
  const file = 'native-v1.0.0-node-v57-' + process.platform + '-' + process.arch + '.tar.gz'
  const prebuild = path.join(cwd, 'prebuilds', file)
  exec('npm run prebuild', { cwd }, function (error, stdout, stderr) {
    t.equal(error, null)
    t.equal(fs.existsSync(prebuild), true)
    t.end()
  })
})

test('can prebuild a cmake-js native module for electron', function (t) {
  fs.rmSync(path.join(cwd, 'prebuilds'), { recursive: true, force: true })
  const file = 'native-v1.0.0-electron-v50-' + process.platform + '-' + process.arch + '.tar.gz'
  const prebuild = path.join(cwd, 'prebuilds', file)
  exec('npm run prebuild-electron', { cwd }, function (error, stdout, stderr) {
    t.equal(error, null)
    t.equal(fs.existsSync(prebuild), true)
    t.end()
  })
})

test('can prebuild a cmake-js native module for node with silent argument', function (t) {
  const file = 'native-v1.0.0-node-v57-' + process.platform + '-' + process.arch + '.tar.gz'
  const prebuild = path.join(cwd, 'prebuilds', file)

  // cmake-js >=8 prints its configure/compile output to stdout and the absolute
  // line count varies per machine, so a fixed threshold is meaningless. Instead
  // assert that the silent flag (`-- -i`) measurably reduces output versus a
  // normal build from the same clean state. The reduction is cmake-js's own
  // INFO logging, which `-i` suppresses.
  function lineCount (script, cb) {
    fs.rmSync(path.join(cwd, 'prebuilds'), { recursive: true, force: true })
    fs.rmSync(path.join(cwd, 'build'), { recursive: true, force: true })
    exec('npm run ' + script, { cwd }, function (error, stdout, stderr) {
      cb(error, stdout.trim() === '' ? 0 : stdout.trim().split('\n').length)
    })
  }

  lineCount('prebuild', function (verboseError, verboseLines) {
    t.equal(verboseError, null, 'normal build succeeds')
    lineCount('prebuild-silent', function (silentError, silentLines) {
      t.equal(silentError, null)
      t.ok(silentLines < verboseLines, 'silent stdout (' + silentLines + ') is quieter than normal (' + verboseLines + ')')
      t.equal(fs.existsSync(prebuild), true)
      t.end()
    })
  })
})
