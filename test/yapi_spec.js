var dummy = { dummy: "dummy" };
var sentinel = { sentinel: "sentinel" };

describe("YAPI", function () {
  describe("#catch", function () {
    it("should run onRejected callback on a already rejected promise", function (done) {
      reject(sentinel).catch(function (reason) {
        expect(reason).toBe(sentinel);
        done();
      });
    });

    it("should run onRejected callback on a immediately rejected promise", function (done) {
      var defer = YAPI.defer();

      defer.promise.catch(function (reason) {
        expect(reason).toBe(sentinel);
        done();
      });

      defer.reject(sentinel);
    });

    it("should run onRejected callback on a eventually rejected promise", function (done) {
      var defer = YAPI.defer();

      defer.promise.catch(function (reason) {
        expect(reason).toBe(sentinel);
        done();
      });

      setTimeout(function () {
        defer.reject(sentinel);
      }, 50);
    });
  });
});