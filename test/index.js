'use strict';

var assert = require('assert');

// Do this so Mocha doesn't think these are leaked globals introduced by the
// tests later.
global.window = global.document = undefined;

function execute() {
  var p = require.resolve('../index');
  delete require.cache[p];
  require(p);
  delete require.cache[p];
}

describe('webstorage-polyfill', function() {
  beforeEach(function() {
    global.window = {};
    global.document = {
      cookie: ''
    };
    global.window.document = global.document;
  });

  it('does not replace existing storage objects', function() {
    var original = window.localStorage = window.sessionStorage = {
      getItem() {},
      setItem() {},
      removeItem() {}
    };
    execute();
    assert.strictEqual(window.localStorage, original);
    assert.strictEqual(window.sessionStorage, original);
  });

  it('replaces missing storage objects', function() {
    assert.strictEqual(window.localStorage, undefined);
    assert.strictEqual(window.sessionStorage, undefined);
    execute();
    assert.strictEqual(typeof window.localStorage, 'object');
    assert.strictEqual(typeof window.sessionStorage, 'object');
  });

  it('does not replace in Safari private mode', function() {
    // In Safari private mode, setItem throws an exception always, and the
    // localStorage and sessionStorage properties of window aren't writable.
    var privateStorage = {
      getItem() {},
      setItem() {
        throw Object.assign(new Error('QuotaExceededError: DOM Exception 22'), {
          code: 22
        });
      },
      removeItem() {}
    };
    Object.defineProperty(window, 'localStorage', {
      value: privateStorage,
      writable: false, enumerable: true, configurable: false
    });
    Object.defineProperty(window, 'sessionStorage', {
      value: privateStorage,
      writable: false, enumerable: true, configurable: false
    });
    execute();
    assert.strictEqual(window.localStorage, privateStorage);
    assert.strictEqual(window.sessionStorage, privateStorage);
  });
});
