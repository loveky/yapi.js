;(function () {
  var global = this;

  function isFunction (value) {
    return typeof value === "function";
  }

  function nextTick (func) {
    setTimeout(func);
  }

  function runCallback(pending, cbType, value) {
    if (isFunction(pending[cbType])) {
      nextTick(function () {
        var result;
        try {
          result = pending[cbType].call(undefined, value);
          resolveProcess(pending.deferred, result);
        }
        catch (e) {
          pending.deferred.reject(e);
        }
      });
    }
    else {
       if (cbType === "onFulfilled") {
        pending.deferred.resolve(value);
       }
       else {
        pending.deferred.reject(value);
       } 
    }
  }

  function resolveProcess(deferred, result) {
    var resolvedOrRejected = false;
    var then;

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

    if (result === deferred.promise) {
      deferred.reject(new TypeError());
    }
    else if (result instanceof Promise) {
      result.then(function (value) {
        deferred.resolve(value);
      }, function (reason) {
        deferred.reject(reason);
      });
    }
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
        fulfill(deferred.promise, result);
      }
    }
    else {
      fulfill(deferred.promise, result);
    }
  }

  function fulfill(promise, value) {
    var i, length;

    promise.value = value;
    promise.status = "fulfilled";

    for (i = 0, length = promise.pendings.length; i < length; i++) {
      runCallback(promise.pendings[i], "onFulfilled", value);
    }
  }

  function Deferred () {
    this.promise = new Promise();
  }

  Deferred.prototype.resolve = function (value) {
    if (this.promise.status !== "pending") {
      return;
    }

    resolveProcess(this, value);
  };

  Deferred.prototype.reject = function (value) {
    var i, length;

    if (this.promise.status !== "pending") {
      return;
    }

    this.promise.value = value;
    this.promise.status = "rejected";

    for (i = 0, length = this.promise.pendings.length; i < length; i++) {
      runCallback(this.promise.pendings[i], "onRejected", value);
    }
  };

  function Promise () {
    this.pendings = [];
    this.status = "pending";
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var deferred = new Deferred();
    var self = this;

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
            resolveProcess(deferred, onFulfilled(self.value));
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
            resolveProcess(deferred, onRejected(self.value));
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
