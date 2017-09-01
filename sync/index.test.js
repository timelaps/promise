var b = require('@timelaps/batterie');
var Promise = require('.');
b.describe('Promise', function () {
    b.expect(Promise).toBeFunction();
    b.it('needs to be passed a function', function (t) {
        t.expect(Promise).toThrow();
        t.expect(function () {
            Promise(function () {});
        }).notToThrow();
    }, 2);
    b.it('can also be passed a thennable', function (t) {
        t.expect(function () {
            Promise({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });
        }).notToThrow();
    });
    b.it('creates an instance of Promise', function (t) {
        t.expect(Promise(function () {})).toBeInstance(Promise);
        t.expect(new Promise(function () {})).toBeInstance(Promise);
    }, 2);
    b.resolve('has can return a resolved promise', function (t) {
        var pointer = {};
        var p = Promise.resolve(pointer);
        t.expect(p).toBeInstance(Promise);
        return p;
    }, 1);
    b.it('will resolve its handlers synchronously', function (t) {
        var pointer = {};
        var p = Promise.resolve(pointer);
        t.expect(p).toBeInstance(Promise);
        p.then(function (value) {
            t.expect(value).toBe(pointer);
        });
    }, 2);
    b.resolve('can chain promises together', function (t) {
        var pointer = {
            counter: 0
        };
        var p = Promise.resolve(pointer).then(function (pointer) {
            t.expect(pointer.counter).toBe(0);
            pointer.counter += 1;
            return pointer;
        }).then(sleep(0)).then(function (pointer) {
            t.expect(pointer.counter).toBe(2);
        });
        t.expect(pointer.counter).toBe(1);
        pointer.counter += 1;
        return p;
    });
    b.resolve('will skip non functions passed to then', function (t) {
        return Promise.resolve(1).then(Promise.resolve(2)).then(function (result) {
            t.expect(result).toBe(1);
        });
    }, 1);
    b.resolve('second argument will not catch errs inside of first', function (t) {
        return Promise(function (success) {
            setTimeout(function () {
                success(null);
            });
        }).then(function (result) {
            // cannot read property of null
            var variable = result.property;
        }, function () {
            t.expect(true).toBeFalse();
        }).catch(function (err) {
            t.expect(err).toBeObject();
        });
    }, 1);
    b.resolve('second argument will catch errs inside previous', function (t) {
        return Promise.resolve().then(function (result) {
            result.nonexistant();
        }).then(function () {
            t.expect(true).toBeFalse();
        }, function (e) {
            t.expect(e).toBeObject();
        });
    }, 1);

    function sleep(timeout) {
        return function (value) {
            return new Promise(function (success) {
                setTimeout(function () {
                    success(value);
                }, timeout);
            });
        };
    }
});