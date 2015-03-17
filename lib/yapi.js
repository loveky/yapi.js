;(function (window, undefined) {

  function isFunction (value) {
    return typeof value === "function";
  }

  function Deferred () {
    this.promise = new Promise();
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
    else if (typeof result === "object" || isFunction(result)) {
      try {
        then = result.then;
      }
      catch (e) {
        deferred.reject(e);
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

  Deferred.prototype.resolve = function (value) {
    var i, length, pending， result, then;

    if (this.promise.status !== "pending") {
      return;
    }

    this.promise.value = value;
    this.promise.status = "fulfilled";

    for (i = 0, length = this.promise.pendings.length; i < length; i++) {
      pending = this.promise.pendings[i];

      if (isFunction(pending.onFulfilled)) {
        try {
          result = pending.onFulfilled(value);
        }
        catch (e) {
          pending.deferred.reject(e);
        }

        resolveProcess(pending.deferred, result);
      }
      else {
        pending.deferred.resolve(value);
      }
    }
  };

  Deferred.prototype.reject = function (value) {
    var i, length, pending， result, then;

    if (this.promise.status !== "pending") {
      return;
    }

    this.promise.value = value;
    this.promise.status = "rejected";

    for (i = 0, length = this.promise.pendings.length; i < length; i++) {
      pending = this.promise.pendings[i];

      if (isFunction(pending.onRejected)) {
        try {
          result = pending.onRejected(value);
        }
        catch (e) {
          pending.deferred.reject(e);
        }

        resolveProcess(pending.deferred, result);
      }
      else {
        pending.deferred.reject(value);
      }
    }
  };

  function Promise () {
    this.pendings = [];
    this.status = "pending";
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var deferred = new Deferred();

    if (this.status === "pending") {
      this.pendings.push({
        deferred: deferred,
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }
    else if (this.status === "fulfilled") {
      isFunction(onFulfilled) && onFulfilled(this.value);
    }
    else if (this.status === "rejected") {
      isFunction(onRejected) && onRejected(this.value);
    }

    return deferred.promise;
  };


  var YAPI = {};

  window.YAPI = YAPI;
})(window);

