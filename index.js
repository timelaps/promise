module.exports = global.Promise || require('./maker')(function (next) {
    setTimeout(next);
});