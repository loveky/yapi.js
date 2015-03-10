describe("YAPI.js", function () {
  describe("YAPI object", function () {
    it("should have a #defer method", function () {
      expect(typeof YAPI.defer).toBe("function");
    });

    describe("deferred object", function () {
      var deferred;

      beforeEach(function () {
        deferred = YAPI.defer();
      });

      it("should have a #resolve method", function () {
        expect(deferred.resolve).toBeDefined();
        expect(typeof deferred.resolve).toBe("function");
      });

      it("should have a #reject method", function () {
        expect(deferred.reject).toBeDefined();
        expect(typeof deferred.reject).toBe("function");
      });

      it("should have a promise property", function () {
        expect(deferred.promise).toBeDefined();
      });
    });

    describe("promise object", function () {
      var deferred, promise;

      beforeEach(function () {
        deferred = YAPI.defer();
        promise = deferred.promise
      });

      it("should have a #then method", function () {
        expect(promise.then).toBeDefined();
        expect(typeof promise.then).toBe("function");
      });

      describe("#then", function () {
        var onFulfilledCallback, onRejectedCallback;

        beforeEach(function () {
          onFulfilledCallback = jasmine.createSpy("onFulfilledCallback");
          onRejectedCallback  = jasmine.createSpy("onRejectedCallback");
        });

        it("should accept fulfilled callback as the first paramter", function () {
          promise.then(onFulfilledCallback, onRejectedCallback);
          deferred.resolve();
          expect(onFulfilledCallback).toHaveBeenCalled();
          expect(onRejectedCallback).not.toHaveBeenCalled();
        });

        it("should accept rejected callback as the second paramter", function () {
          promise.then(onFulfilledCallback, onRejectedCallback);
          deferred.reject();
          expect(onFulfilledCallback).not.toHaveBeenCalled();
          expect(onRejectedCallback).toHaveBeenCalled();
        });

        it("should allow call #then multi times on a promise", function () {
          var onFulfilledCallback2 = jasmine.createSpy("onFulfilledCallback2");
          var onRejectedCallback2  = jasmine.createSpy("onRejectedCallback2");

          promise.then(onFulfilledCallback, onRejectedCallback);
          promise.then(onFulfilledCallback2, onRejectedCallback2);

          deferred.resolve();

          expect(onFulfilledCallback).toHaveBeenCalled();
          expect(onFulfilledCallback2).toHaveBeenCalled();
        });

        it("should allow call #then on a already fulfilled/rejected promise", function () {
          var onFulfilledCallback2 = jasmine.createSpy("onFulfilledCallback2");
          deferred.resolve();
          promise.then(onFulfilledCallback2);

          expect(onFulfilledCallback2).toHaveBeenCalled();
        });
      });
    });
  });
});