;(function (window, undefined) {
  var YAPI = {};

  YAPI.defer = function () {
    var deferred = {};
    var state = "pending";

    var result;

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

