var b = require('@timelaps/batterie');
var Promise = require('.');
b.describe('Promise', function () {
    b.expect(Promise).toBeFunction();
});