function DecimalParserFactory(globals) {
 function _sandbox(callback) {
  // Temporarily replace parseFloat() and parseInt() with versions that
  // return strings while executing callback.  (parseInt() will still
  // return Numbers for radices other than 2, 10, or 16.)  This ensures
  // that the expr-eval parser does not convert numeric literals to
  // floating point Number objects, which can compromise accuracy.
  // For this to work, the argument passed to DecimalParserFactory
  // should be the top-level object under which the code for
  // expr-eval.js was evaluated.
  
  var _parseFloat = globals.parseFloat;
  globals.parseFloat = function __DecimalParser_parseFloat(value) {
   return String(value);
  };
  
  var _parseInt = globals.parseInt;
  globals.parseInt = function __DecimalParser_parseInt(value, radix) {
   if (radix == 10 || typeof radix == "undefined")
    return String(value);
   
   if (radix == 16 || radix == 2) {
    var prefixes = {16: "0x", 2: "0b"};
    globals.parseInt = _parseInt;
    var result = Decimal(prefixes[radix] + String(value)).toString();
    globals.parseInt = __DecimalParser_parseInt;
    return result;
   }
   
   return _parseInt(value, radix);
  }
  
  var result = callback();
  
  globals.parseFloat = _parseFloat;
  globals.parseInt = _parseInt;
  
  return result;
 };
 
 
 return function DecimalParser(options) {
  if (typeof options != "object") options = {};
  let o = _sandbox(() => new exprEval.Parser(options));
  
  let D = Decimal;
  let fromBool = (a) => D(a ? 1 : 0);
  let bool = (a) => D(a).isZero() ? 0 : 1;
  let not = (a) => D(a).isZero() ? 1 : 0;
  let fact = o.unaryOps["!"];
  let gamma = o.functions["gamma"];
  
  o.functions["atan2"] = (a, b) => D.atan2(a, b);
  o.functions["fac"] = (a) => D(fact(D(a).toNumber()));
  o.functions["gamma"] = (a) => D(gamma(D(a).toNumber()));
  o.functions["hypot"] = (a, b) => D.hypot(a, b);
  o.functions["if"] = (a, b, c) => D(bool(a) ? b : c);
  o.functions["max"] = (a, b) => D.max(a, b);
  o.functions["min"] = (a, b) => D.min(a, b);
  o.functions["pow"] = (a, b) => D.pow(a, b);
  o.functions["pyt"] = (a, b) => D.hypot(a, b);
  o.functions["random"] = (a) => D.random().times(a || 1);
  o.functions["roundTo"] = (a, b) => D(a).toDP(b);
  
  o.unaryOps["!"] = (a) => D(fact(D(a).toNumber()));
  o.unaryOps["+"] = (a) => D(a);
  o.unaryOps["-"] = (a) => D(a).neg();
  o.unaryOps["abs"] = (a) => D.abs(a);
  o.unaryOps["acos"] = (a) => D.acos(a);
  o.unaryOps["acosh"] = (a) => D.acosh(a);
  o.unaryOps["asin"] = (a) => D.asin(a);
  o.unaryOps["asinh"] = (a) => D.asinh(a);
  o.unaryOps["atan"] = (a) => D.atan(a);
  o.unaryOps["atanh"] = (a) => D.atanh(a);
  o.unaryOps["ceil"] = (a) => D.ceil(a);
  o.unaryOps["cos"] = (a) => D.cos(a);
  o.unaryOps["cosh"] = (a) => D.cosh(a);
  o.unaryOps["exp"] = (a) => D.exp(a);
  o.unaryOps["floor"] = (a) => D.floor(a);
  o.unaryOps["length"] = (a) => D(D(a).toString().length);
  o.unaryOps["lg"] = (a) => D.log10(a);
  o.unaryOps["ln"] = (a) => D.ln(a);
  o.unaryOps["log"] = (a) => D.ln(a);
  o.unaryOps["log10"] = (a) => D.log10(a);
  o.unaryOps["not"] = (a) => D(not(a));
  o.unaryOps["round"] = (a) => D.round(a);
  o.unaryOps["sin"] = (a) => D.sin(a);
  o.unaryOps["sinh"] = (a) => D.sinh(a);
  o.unaryOps["sqrt"] = (a) => D.sqrt(a);
  o.unaryOps["tan"] = (a) => D.tan(a);
  o.unaryOps["tanh"] = (a) => D.tanh(a);
  o.unaryOps["trunc"] = (a) => D.trunc(a);
  
  o.binaryOps["%"] = (a, b) => D.mod(a, b);
  o.binaryOps["*"] = (a, b) => D.mul(a, b);
  o.binaryOps["+"] = (a, b) => D.add(a, b);
  o.binaryOps["-"] = (a, b) => D.sub(a, b);
  o.binaryOps["/"] = (a, b) => D.div(a, b);
  o.binaryOps["^"] = (a, b) => D.pow(a, b);
  
  o.binaryOps["!="] = (a, b) => fromBool(!D(a).eq(b));
  o.binaryOps["<"]  = (a, b) => fromBool(D(a).lt(b));
  o.binaryOps["<="] = (a, b) => fromBool(D(a).lte(b));
  o.binaryOps["=="] = (a, b) => fromBool(D(a).eq(b));
  o.binaryOps[">"]  = (a, b) => fromBool(D(a).gt(b));
  o.binaryOps[">="] = (a, b) => fromBool(D(a).gte(b));
  
  o.binaryOps["and"] = (a, b) => D(bool(bool(a) && bool(b)));
  o.binaryOps["or"]  = (a, b) => D(bool(bool(a) || bool(b)));
  
  o.ternaryOps["?"] = (a, b, c) => D(bool(a) ? b : c);
  
  o.consts["PI"] = D.acos(-1);
  o.consts["E"] = D.pow(10, D.div(1, D.ln(10)));
  
  o._extras = {};
  o._extras.bool = (a) => bool(a);
  o._extras.fromBool = (a) => fromBool(a);
  
  o._parse = o.parse;
  o.parse = (expr) => _sandbox(() => o._parse(expr));
  
  o._sandbox = (a) => _sandbox(a);
  
  return o;
 }
}


DecimalParserFactory.egg = function egg() {
 console.error(
  "       I TRIED TO PARSE A DECIMAL WITH JAVASCRIPT       \n" +
  "                                                        \n" +
  "                            ,--.                        \n" +
  "                           /-__ \\                       \n" +
  "                          |\\\\\\   |                      \n" +
  "                          |\\\\\\\\/|D                      \n" +
  "                          = \\  //                       \n" +
  "                      __=--`-\\_\\--,__                   \n" +
  "                     /#######\\   \\###`\\                 \n" +
  "                    /         \\   \\|  |                 \n" +
  "                   /   /|      \\   \\  |                 \n" +
  "                  /   / |       \\     |                 \n" +
  "                 /   /  |/u/surkh\\    /                 \n" +
  "                                                        \n" +
  "           I NOW HAVE A  DECIMALPARSERFACTORY           "
 );
}
