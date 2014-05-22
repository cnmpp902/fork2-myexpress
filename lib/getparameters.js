var getParameters = function (fn) {
  var fnText = fn.toString();
  if (getParameters.cache[fnText]) {
    return getParameters.cache[fnText];
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

  getParameters.cache[fn] = inject;
  return inject;
};

getParameters.cache = {};

module.exports = getParameters;
