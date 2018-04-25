'use strict';

const should = require('chai').should(),  // eslint-disable-line no-unused-vars
  // tests from http://node.green
  testers = require('./testers.json');

// This function is needed to run the tests and was extracted from:
// https://github.com/kangax/compat-table/blob/gh-pages/node.js
global.__createIterableObject = (arr, methods) => {
  methods = methods || {};

  if (typeof Symbol !== 'function' || !Symbol.iterator) {
    return {};
  }

  arr.length++;

  let iterator = {
    next: () => ({value: arr.shift(), done: arr.length <= 0}),
    return: methods.return,
    throw: methods.throw
  };

  let iterable = {};

  iterable[Symbol.iterator] = () => iterator;

  return iterable;
};


let ESVersions = Object.keys(testers),
  fails = [];


/**
 *
 * ES tests
 *
 */

describe('ESVersion tests', () => {
  it('should pass all ESTests', done => setTimeout(next, 10, ESVersions.pop(), done));
});


/**
 * Run "ESVersion" tests set
 *
 * @param   {string}     ESVersion
 * @param   {function}   done
 */
function next(ESVersion, done) {
  if (!ESVersion) {
    fails.should.deep.equal([]);

    done();
  }

  let count = Object.keys(testers[ESVersion]).length,
    completed = 0;

  Object.keys(testers[ESVersion]).forEach(name => {
    let script = testers[ESVersion][name];

    run(script, result => {
      // expected results: `e.message` or true/false
      if (typeof result === 'string') {
        fails.push(`«${ESVersion}::${name}» test failed with error "${result}"`);
      } else if (Boolean(result) === false) {
        fails.push(`«${ESVersion}::${name}» test return false`);
      }

      ++completed === count && setTimeout(next, 10, ESVersions.pop(), done);
    });
  });
}

/**
 * Run script
 *
 * @param   {string}     script
 * @param   {function}   cb
 */
function run(script, cb) {
  // kangax's Promise tests reply on a asyncTestPassed function.
  let async = /asyncTestPassed/.test(script);

  if (async) {
    runAsync(script, result => {
      if (!result || typeof result === 'string') {
        runAsync(strict(script), cb);
        return;
      }

      cb(result);
    });
  } else {
    let result = runSync(script);

    if (!result || typeof result === 'string') {
      result = runSync(strict(script));
    }

    cb(result);
  }
}

/**
 * Run async script
 *
 * @param   {string}     script
 * @param   {function}   cb
 */
function runAsync(script, cb) {
  let timer = null;

  try {
    let fn = new Function('asyncTestPassed', script);

    fn(function() {
      clearTimeout(timer);
      process.nextTick(function() {
        cb(true);
      });
    });

    timer = setTimeout(function() {
      cb(false);
    }, 5000);
  } catch (e) {
    clearTimeout(timer);
    process.nextTick(function() {
      cb(e.message);
    });
  }
}

/**
 * Run sync script
 *
 * @param   {string}   script
 * @returns {*}
 */
function runSync(script) {
  try {
    let fn = new Function(script);

    return fn() || false;
  } catch (e) {
    return e.message;
  }
}

/**
 * Add "use strict" prefix to script
 *
 * @param    {string}   script
 * @returns  {string}
 */
function strict(script) {
  return '"use strict"\n' + script;
}
