var falcor = require('falcor');
var HttpDataSource = require('falcor-http-datasource');

Elm.Native.Falcor = {};


// make is a function that takes an instance of the
// elm runtime
// returns an object where:
//      keys are names to be accessed in pure Elm
//      values are either functions or values
Elm.Native.Falcor.make = function make(elm) {
    // If Native isn't already bound on elm, bind it!
    elm.Native = elm.Native || {};
    // then the same for our module
    elm.Native.Falcor = elm.Native.Falcor || {};
    elm.Native.Falcor.make = make;

    // `values` is where the object returned by make ends up internally
    // return if it's already set, since you only want one definition of
    // values for speed reasons
    if (elm.Native.Falcor.values)
      return elm.Native.Falcor.values;

    var Task = Elm.Native.Task.make(elm);
    var Utils = Elm.Native.Utils;

    function createModel(url) {
      if (url.length > 0) {
        return new falcor.Model({source: new HttpDataSource(url)});
      } else {
        return new falcor.Model();
      }
    }

    function get(model, dataList) {
      var args = [];
      while (dataList.ctor !== '[]') {
        args.push(dataList._0);
        dataList = dataList._1;
      }
      return Task.asyncFunction(function(callback) {
        // console.log(args);
        model.get
          .apply(model, args)
          .then(function(resp) {
            // console.log(resp.json);
            return callback(Task.succeed(resp.json));
          })
          .catch(function(err) {
            return callback(Task.fail(err));
          });
      });
    }

    function set() {

    }

    function call() {

    }
    // return the object of your module's stuff!
    return elm.Native.Falcor.values = {
      createModel: createModel,
      get: F2(get),
      set: set,
      call: call
    };
};
