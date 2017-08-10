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
});