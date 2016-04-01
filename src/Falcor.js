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

    function createModel(mdl) {
      var modelOptions = {
        /*
        errorSelector: function(err) {
          console.error(err);
          return err;
        }*/
        // onChange: function(err) { console.log(this) }
      };

      if (mdl.url.ctor === 'Just') {
        var opts = {};
        if (mdl.headers.ctor === 'Just') {
          opts.headers = {};
          convertArray(mdl.headers._0).forEach(function(tuple) {
            opts.headers[tuple._0] = tuple._1;
          });
          // opts.headers = mdl.headers._0;
        }
        modelOptions.source = new HttpDataSource(mdl.url._0, opts);
      }

      if (mdl.cache.ctor === 'Just') {
        modelOptions.cache = mdl.cache._0;
      }

      var model = new falcor.Model(modelOptions);
      console.log(modelOptions);

      mdl.model = {ctor: "Just", _0: model};
      window.model = model;
      return mdl;
    }

    function get(model, args) {
      return Task.asyncFunction(function(callback) {
        var falcorModel = getFalcorModel(model);
        falcorModel.get
          .apply(falcorModel, args)
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
      // console.log(model, path, value);
      return Task.asyncFunction(function(callback) {
        getFalcorModel(model).setValue(path, value)
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

    function call(model, functionPath, args) { //}, _refSuffixes, thisPaths) {
      // var args = convertArray(_args);
      // var refSuffixes = convertArray(_refSuffixes);

      return Task.asyncFunction(function(callback) {
        (getFalcorModel(model)).call(functionPath, args) //, refSuffixes, thisPaths)
          .then(function(resp) {
            if (resp && resp.json) {
              var out = filterPathKeys(resp.json);
              // console.log("respcall", args, out);
              return callback(Task.succeed(out));
            } else {
              // console.log("empty response");
              // return callback(Task.succeed({}));
              throw "empty response";
            }
          })
          .catch(function(err) {
            console.log("callerr", err);
            return callback(Task.fail(err));
          });
      });
    }

    // return the object of your module's stuff!
    return localRuntime.Native.Falcor.values = {
      createModel: createModel,
      get: F2(get),
      setValue: F3(setValue),
      set: set,
      call: F3(call)
    };
};


function filterPathKeys(obj) {
  var out = {};
  if (obj !== null) {
    Object.keys(obj).forEach(function(key) {
      if(key !== "$__path") {
        var val = obj[key];
        if ((typeof val) === "object" && !(val instanceof Array)) {
          out[key] = filterPathKeys(val);
        } else {
          out[key] = val;
        }
      }
    });
  }
  return out;
}

function convertArray(_args) {
  var args = [];
  while (_args.ctor !== '[]') {
    args.push(_args._0);
    _args = _args._1;
  }
  return args;
}

function getFalcorModel(elmModel) {
  return elmModel.model._0;
}
