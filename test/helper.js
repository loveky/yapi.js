// return a already fulfilled promise
function resolve (value) {
  var defer = YAPI.defer();
  defer.resolve(value);
  return defer.promise;
}

// return a already rejected promise
function reject (reason) {
  var defer = YAPI.defer();
  defer.reject(reason);
  return defer.promise;
}