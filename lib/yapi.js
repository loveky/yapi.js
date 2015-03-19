;(function () {
  var global = this;

  function isFunction (value) {
    return typeof value === "function";
  }

  function nextTick (func) {
    setTimeout(func);
  }

  function resolveProcess(deferred, result) {
    var resolvedOrRejected = false;

    var resolvePromise = function (value) {
      if (!resolvedOrRejected) {
        resolvedOrRejected = true;
        resolveProcess(deferred, value);
      }
    };

    var rejectPromise = function (reason) {
      if (!resolvedOrRejected) {
        resolvedOrRejected = true;
        deferred.reject(reason);
      }
    };

    // [[Resolve]](promise, x)
    if (result === deferred.promise) {
      deferred.reject(new TypeError());
    }

    // 2.3.2 If x is a promise, adopt its state
    if (result instanceof Promise) {
      result.then(function (value) {
        deferred.resolve(value);
      }, function (reason) {
        deferred.reject(reason);
      });
    }
    // 2.3.3 Otherwise， if x is an object or function
    else if (typeof result === "object" && result !== null || isFunction(result)) {
      try {
        then = result.then;
      }
      catch (e) {
        deferred.reject(e);
      }

      if (deferred.promise.status !== "pending") {
        return;
      }

      if (isFunction(then)) {
        try {
          then.call(result, resolvePromise, rejectPromise);
        }
        catch (e) {
          if (!resolvedOrRejected) {
            deferred.reject(e);
          }
        }
      }
      else {
        deferred.resolve(result);
      }
    }
    // 2.3.4 If x is not an object or function, fulfill promise with x
    else {
      deferred.resolve(result);
    }
  }

  function Deferred () {
    this.promise = new Promise();
  }

  Deferred.prototype.resolve = function (value) {
    var i, length, pending, result, then;

    if (this.promise.status !== "pending") {
      return;
    }

    this.promise.value = value;
    this.promise.status = "fulfilled";

    for (i = 0, length = this.promise.pendings.length; i < length; i++) {
      pending = this.promise.pendings[i];
      (function (pending) {
        if (isFunction(pending.onFulfilled)) {
          nextTick(function () {
            var result;
            try {
              result = pending.onFulfilled.call(undefined, value);
              resolveProcess(pending.deferred, result);
            }
            catch (e) {
              pending.deferred.reject(e);
            }
          });
        }
        else {
          pending.deferred.resolve(value);
        }
      })(pending);
    }
  };

  Deferred.prototype.reject = function (value) {
    var i, length, pending, result, then;

    if (this.promise.status !== "pending") {
      return;
    }

    this.promise.value = value;
    this.promise.status = "rejected";

    for (i = 0, length = this.promise.pendings.length; i < length; i++) {
      pending = this.promise.pendings[i];

      (function (pending) {
        if (isFunction(pending.onRejected)) {
          nextTick(function () {
            var result;
            try {
              result = pending.onRejected.call(undefined, value);
              resolveProcess(pending.deferred, result);
            }
            catch (e) {
              pending.deferred.reject(e);
            }
          });
        }
        else {
          pending.deferred.reject(value);
        }
      })(pending);
    }
  };

  function Promise () {
    this.pendings = [];
    this.status = "pending";
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var deferred = new Deferred();
    var self = this;
    var result;

    if (this.status === "pending") {
      this.pendings.push({
        deferred: deferred,
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }
    else if (this.status === "fulfilled") {
      if (isFunction(onFulfilled)) {
        nextTick(function () {
          try {
            result = onFulfilled(self.value);
            resolveProcess(deferred, result);
          }
          catch (e) {
            deferred.reject(e);
          }
        });
      }
      else {
        deferred.resolve(this.value);
      }
    }
    else if (this.status === "rejected") {
      if (isFunction(onRejected)) {
        nextTick(function () {
          try {
            result = onRejected(self.value);
            resolveProcess(deferred, result);
          }
          catch (e) {
            deferred.reject(e);
          }
        });
      }
      else {
        deferred.reject(this.value);
      }

    }

    return deferred.promise;
  };


  var YAPI = {};

  YAPI.defer = function () {
    return (new Deferred());
  };

  YAPI.createPromise = function (func) {
    var deferred = new Deferred();

    var resolvePromise = function (value) {
      deferred.resolve(value);
    };

    var rejectPromise = function (reason) {
      deferred.reject(reason);
    };

    func.call(null, resolvePromise, rejectPromise);

    return deferred.promise;
  };

  if (typeof module != 'undefined') {
    module.exports = YAPI;
  } else {
    global.YAPI = YAPI;
  }
})();
