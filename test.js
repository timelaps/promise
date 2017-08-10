var b = require('@timelaps/batterie');
b.capture(function () {
    require('./tests.js');
});
b.finish().then(b.logger());