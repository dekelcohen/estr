
// TODO: - do we need to sort AST children in source order?
//          if yes, it might be good to keep index of sorted keys
//       - replace property key blacklist with child key whitelist

(function(require,exports){

function hashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


exports.hashCode = hashCode;

}(typeof require==='function'
   ? require
   : function(dependency) { return require.cache[dependency] }
 ,typeof exports==='object'
   ? exports
   : (require.cache ? require.cache:require.cache={})['./util/common.js'] = {}
 ));

