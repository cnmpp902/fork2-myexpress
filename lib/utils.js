exports.getParameters = function (fn) {
  var fnText = fn.toString();
  if (exports.getParameters.cache[fnText]) {
    return exports.getParameters.cache[fnText];
  }

  var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
      FN_ARG_SPLIT   = /,/,
      FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/,
      STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

  var inject = [];
  var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);
  argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
    arg.replace(FN_ARG, function(all, underscore, name) {
      inject.push(name);
    });
  });

  exports.getParameters.cache[fn] = inject;
  return inject;
};

exports.getParameters.cache = {};

exports.jsonConcat = function(o1,o2){
  for (var key in o2) {
    o1[key] = o2[key];
  }
  return o1;
};

exports.arraysEqual = function(arr1, arr2) {
  if (arr1 === arr2) return true;
  if (arr1 === null || arr2 === null) return false;
  if (arr1.length != arr2.length) return false;

  for (var i = 0; i < arr1.length; ++i) {
    if (arr1[i] !== arr2[i]) return false;
  }

  return true;
};

exports.needInject = function(parameters) {
  var skipRules = [
    [],
    ['req'],
    ['req', 'res'],
    ['req', 'res', 'next'],
    ['err', 'req', 'res', 'next'],
    ['error', 'req', 'res', 'next']
  ];
  for (var i = 0; i < skipRules.length; ++i) {
    if (exports.arraysEqual(skipRules[i], parameters)) {
      return false;
    }
  }
  return true;
};
