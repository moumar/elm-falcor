var falcor = require('falcor');
var HttpDataSource = require('falcor-http-datasource');
window.falcor = falcor;

Elm.Native.Falcor = {};


// make is a function that takes an instance of the
// elm runtime
// returns an object where:
//      keys are names to be accessed in pure Elm
//      values are either functions or values
Elm.Native.Falcor.make = function make(localRuntime) {
    // If Native isn't already bound on elm, bind it!
    localRuntime.Native = localRuntime.Native || {};
    // then the same for our module
    localRuntime.Native.Falcor = localRuntime.Native.Falcor || {};
    localRuntime.Native.Falcor.make = make;

    // `values` is where the object returned by make ends up internally
    // return if it's already set, since you only want one definition of
    // values for speed reasons
    if (localRuntime.Native.Falcor.values)
      return localRuntime.Native.Falcor.values;

    var Task = Elm.Native.Task.make(localRuntime);
    var Utils = Elm.Native.Utils;
    var Maybe = Elm.Maybe.make(localRuntime);
    window.Utils = Utils
    function createModel(options) {
      var modelOptions = {};
      if (options.url.ctor === 'Just') {
        modelOptions.source = new HttpDataSource(options.url._0);
      }
      if (options.cache.ctor === 'Just') {
        modelOptions.cache = options.cache._0;
      }
      var model = new falcor.Model(modelOptions);
      window.model = model;
      return model;
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
            if (resp && resp.json) {
              var out = filterPathKeys(resp.json);
              console.log("resp", args, out);
              return callback(Task.succeed(out));
            } else {
              // console.log("empty response");
              // return callback(Task.succeed({}));
              throw "empty response";
            }
          })
          .catch(function(err) {
            console.log("err", args, err);

            return callback(Task.fail(err));
          });
      });
    }

    function setValue(model, path, value) {
      return Task.asyncFunction(function(callback) {
        model.setValue(path, value)
          .then(function() {
            callback(Task.succeed(Utils.tuple0));
          })
          .catch(function(err) {
            callback(Task.fail(err));
          })
      })
    }

    function set() {

    }

    function call() {

    }
    // return the object of your module's stuff!
    return localRuntime.Native.Falcor.values = {
      createModel: createModel,
      get: F2(get),
      setValue: F3(setValue),
      set: set,
      call: call
    };
};


function filterPathKeys(obj) {
  var out = {};
  if (obj != null) {
    Object.keys(obj).forEach(function(key) {
      if(key != "$__path") {
        var val = obj[key];
        if ((typeof val) == "object" && !(val instanceof Array)) {
          out[key] = filterPathKeys(val);
        } else {
          out[key] = val;
        }
      }
    });
  }
  return out;
}
