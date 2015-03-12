;(function (window, undefined) {

  function isFunction (value) {
    return typeof value === "function";
  }

  function Deferred () {
    this.promise = new Promise();
  }

  Deferred.prototype.resolve = function (value) {
    var i, length, pending， result;

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

        if (result === pending.deferred.promise) {
          pending.deferred.reject(new TypeError());
        }

        if (result instanceof Promise) {
          result.then(function (value) {
            pending.deferred.resolve(value);
          }, function (reason) {
            pending.deferred.reject(reason);
          });
        }
      }
      else {
        pending.deferred.resolve(value);
      }
    }
  };

  Deferred.prototype.reject = function (value) {
    this.promise.value = value;
    this.promise.status = "rejected";
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

  YAPI.defer = function () {
    var deferred = {};
    var state = "pending";

    var result;

    var then

    var onFulfilledCallbacks = [];
    var onRejectedCallbacks = [];

    deferred.resolve = function (value) {
      var i, length;

      if (state !== "pending") {
        return;
      }

      state = "fulfilled";
      result = value;

      for (i = 0, length = onFulfilledCallbacks.length; i < length; i++) {
        onFulfilledCallbacks[i](value);
      }
    };

    deferred.reject = function (reason) {
      var i, length;

      if (state !== "pending") {
        return;
      }

      state = "rejected";
      result = reason;

      for (i = 0, length = onRejectedCallbacks.length; i < length; i++) {
        onRejectedCallbacks[i](reason);
      }
    };

    deferred.promise = {
      then: function (onFulfilled, onRejected) {
        if (state === "pending") {
          if (typeof onFulfilled === "function") {
            onFulfilledCallbacks.push(onFulfilled);
          }

          if (typeof onRejected === "function") {
            onRejectedCallbacks.push(onRejected);
          }
        }
        else {
          if (state === "fulfilled" && typeof onFulfilled === "function") {
            onFulfilled(result);
          }

          if (state === "rejected" && typeof onRejected === "function") {
            onRejected(result);
          }
        }
      }
    };

    return deferred;
  };

  window.YAPI = YAPI;
})(window);

