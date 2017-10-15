var QUEUE = 'queue',
    PENDING = 'pending',
    REJECTED = 'rejected',
    FULFILLED = 'fulfilled',
    isThennable = require('@timelaps/is/thennable'),
    isArrayLike = require('@timelaps/is/array-like'),
    returnsArray = require('@timelaps/returns/array'),
    returnsFirst = require('@timelaps/returns/first'),
    wrapTry = require('@timelaps/fn/wrap-try'),
    once = require('@timelaps/fn/once'),
    isFunction = require('@timelaps/is/function'),
    isInstance = require('@timelaps/is/instance'),
    forEach = require('@timelaps/n/for/each'),
    map = require('@timelaps/n/map'),
    throws = require('@timelaps/fn/throws');
/**
 * Implementation just like the native one. Use this object in order to ensure that your promises will work across all browsers, including those that do not support Promises natively. Pass true as the second argument to make the class execute the function synchronously. This prevents the stack jump that regular promises enforce.
 * @class Promise
 * @example <caption>The following promise executes and waits until the success or failure callback is called to resolve.</caption>
 * _.Promise(function (success, failure) {
 *     success();
 * });
 */
module.exports = function maker(asap) {
    Promise.prototype = {
        /**
         * Creates a new promise and fulfills it, if the current context is fulfilled / rejected then the new promise will be resolved in the same way.
         * @param  {Function} success handler to be called when the promise is fulfilled
         * @param  {Function} failure handler to be called when the promise is rejected
         * @return {Promise} new promise
         */
        then: next(function (pro, a_, b) {
            var a = isFunction(a_) ? a_ : returnsFirst;
            return [pro, a, b];
        }),
        /**
         * Catches errors in the then success / failure handlers.
         * @param  {Function} erred Handler to run if a previous handler errs out.
         * @return {Promise}
         * @example
         * Promise(function () {
         *     // asap process
         * }).then(function () {
         *     throw new Error("invalid result detected");
         * }).catch(function (e) {
         *     e.message // "invalid result detected"
         *     return "default value";
         * }).then(function (result) {
         *     result === "default value"; // true
         * });
         */
        catch: next(function (pro, a_) {
            var a = isFunction(a_) ? a_ : returnsFirst;
            return [pro, null, a];
        })
    };

    function next(fn) {
        return function (a, b) {
            var promise = this;
            return promiseProxy(function (pro) {
                var intrnl = internal(promise);
                addToQueue(promise, QUEUE, fn(pro, a, b));
                if (intrnl[PENDING]) {
                    return;
                }
                emptyQueue(promise, intrnl[FULFILLED], resultant(promise));
            });
        }
    }
    /**
     * Waits for all promises passed into it to wait and succeed. Will be rejected if any of the promises are rejcted
     * @name Promise#all
     * @param {Array} promises list of promises to wait to complete.
     * @example
     * var newpromise = Promise.all([p1, p2, p3]).then(function (results) {
     *     _.isArray(results); // true
     * });
     */
    Promise.all = raceAllCurry(true);
    /**
     * Waits for any of the promises to complete. A fulfillment or rejection of any of the promises passed in would trigger the resolution in the same direction of the promise that gets created.
     * @name Promise#race
     * @param {Array} promises list of promises to wait to complete.
     * @example
     * var racePromise = Promise.race([p1, p2, p3]).then(function (first) {
     *     // first one to finish wins!
     * });
     */
    Promise.race = raceAllCurry();
    Promise.resolve = autoResolve(true);
    Promise.reject = autoResolve();
    return Promise;

    function Promise(fn_) {
        if (!isInstance(this, Promise)) {
            return new Promise(fn_);
        } else if (isInstance(fn_, Promise)) {
            return fn_;
        }
        var pro, thenner, catcher, fn = fn_,
            promise = this,
            intnrl = internal(promise);
        intnrl[PENDING] = true;
        if (isThennable(fn)) {
            // native promise or alternate promise
            pro = fn;
            fn = function (s, f) {
                // do nothing with the resulting promise
                pro.then(s, f);
            };
        }
        thenner = decision(promise, true);
        catcher = decision(promise, false);
        fn(thenner, catcher);
        return promise;
    }

    function raceAllCurry(waits) {
        return function (list, bool) {
            if (!isArrayLike(list)) {
                throws('promise list is not iteratable.');
            }
            return Promise(function (success, failure) {
                var failed, length = list.length,
                    memo = [];
                if (!length) {
                    return success([]);
                }
                forEach(list, function (promise, index) {
                    if (isThennable(promise)) {
                        promise.then(function (data) {
                            counter(index, data);
                        }, function (res) {
                            failed = true;
                            return counter(index, res);
                        });
                    } else {
                        counter(index, promise);
                    }
                });

                function counter(index, data) {
                    length--;
                    if (failed) {
                        return failure(data);
                    }
                    if (waits) {
                        memo[index] = data;
                        if (!length) {
                            success(memo);
                        }
                    } else {
                        success(data);
                    }
                }
            });
        };
    }

    function autoResolve(bool) {
        return function (value) {
            if (bool && isThennable(value)) {
                return value;
            } else {
                return Promise(function (success, failure) {
                    return bool ? success(value) : failure(value);
                });
            }
        };
    }

    function emptyQueue(p, bool, result, original) {
        var nextresolution, erred, sliced, resultIsPromise, i, current, argument, caught, nextp, intrnl = internal(p),
            queue = intrnl[QUEUE],
            pending = intrnl[PENDING];
        if (original) {
            intrnl[PENDING] = false;
            if (!pending) {
                // one of the functions has already been called
                return result;
            }
        }
        intrnl[PENDING] = false;
        intrnl[bool ? FULFILLED : REJECTED] = true;
        intrnl.result = result;
        if (!queue || !queue.length) {
            // nothing to do
            return result;
        }
        delete intrnl[QUEUE];
        var bound = map(queue, function (current) {
            var nextp = current[0],
                nextresolution = true,
                argument = wrapTry(execute, catches);
            return callNext;

            function callNext(reduced) {
                if (isThennable(argument)) {
                    argument.then(emptiesQueue(nextp, nextresolution), emptiesQueue(nextp));
                } else {
                    emptyQueue(nextp, nextresolution, argument, false);
                }
            }

            function execute() {
                var target, res = result;
                if (bool) {
                    target = current[1];
                } else {
                    target = current[2];
                    if (!target) {
                        throw res;
                    }
                }
                res = target ? target(res) : res;
                internal(nextp).result = res;
                return res;
            }

            function catches(e) {
                nextresolution = false;
                internal(nextp).result = result;
                return e;
            }
        });
        forEach(bound, callBound);
        return result;
    }

    function emptiesQueue(p, bool, original) {
        return function (argument) {
            asap(empty);

            function empty() {
                return emptyQueue(p, bool, argument, original);
            }
        };
    }

    function decision(p, bool) {
        return once(emptiesQueue(p, bool, true));
    }

    function promiseProxy(fn) {
        var s, f, doit = function (pro) {
            if (s && f) {
                fn(pro, s, f);
            } else {
                setTimeout(function () {
                    doit(pro);
                });
            }
            return pro;
        };
        return doit(Promise(function (success, failure) {
            s = success;
            f = failure;
        }));
    }
};

function callBound(fn) {
    fn();
}

function addToQueue(promise, key, list) {
    getQueue(promise, key).push(list);
}

function getQueue(p, key) {
    var intrnl = internal(p);
    var queue = intrnl[key] = intrnl[key] || [];
    return queue;
}

function internal(promise) {
    var internal = promise.internal = promise.internal || {};
    return internal;
}

function resultant(promise) {
    return internal(promise).result;
}