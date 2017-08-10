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
    });
});