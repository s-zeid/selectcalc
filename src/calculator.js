let Calculator = {};


Calculator.calculate = function(expr, eggs) {
 var D = Decimal;
 var DecimalParser = DecimalParserFactory(window);
 
 // fast path for egg matches
 if (Array.isArray(eggs) && eggs.includes(expr.trim()))
  return {value: expr, expr: expr}
 else
  expr = Calculator._sanitize(expr);
 
 var value;
 if (Array.isArray(eggs) && eggs.includes(expr)) {
  value = expr;
 } else {
  var parser = DecimalParser({ operators: { "in": true } });
  parser.unaryOps["^"] = parser.unaryOps["not"];
  parser.binaryOps["in"] = (a, b) => D(a).divToInt(b);  // aliased to `//` below
  
  value = String(parser.parse(expr).evaluate({
   tau: D.acos(-1).times(2),
   
   divint: (a, b) => D(a).divToInt(b),
   divtoint: (a, b) => D(a).divToInt(b),
   divmod: (a, b) => [D(a).divToInt(b).toString(), D.mod(a, b).toString()].join(", "),
   
   isnan: (a) => parser._extras.fromBool(D(a).isNaN()),
   nan: D.div(0, 0),
   inf: D.div(1, 0),
   infinity: D.div(1, 0),
  }));
 }
 
 return {
  value: value,
  expr: expr
 };
}


Calculator._sanitize = function(inExpr) {
 var result = "";
 
 // normalize whitespace and remove trailing `.`s and `?`s
 inExpr = inExpr.replace(/[\r\n\t]/g, " ");
 inExpr = inExpr.replace(/[.?] *$/, "");
 
 // temporarily escape exponent notation and functions with numbers in their names
 inExpr = inExpr.replace(/([0-9])e([0-9])/, "$1\\expNotation$2");
 inExpr = inExpr.replace(/\\atan2 *\(/g, "\\atantwo(");
 inExpr = inExpr.replace(/\\log10 *\(/g, "\\logten(");
 inExpr = inExpr.replace(/\\log10 +/g, "\\logten ");
 
 var exprParts = inExpr.replace(/(\\[a-z]*)/gi, "$1\\").split("\\");
 var isSymbol = exprParts.length && exprParts[0].startsWith("\\");
 for (var i = 0; i < exprParts.length; i++) {
  var part = exprParts[i];
  if (isSymbol) {
   if (part == "" && i != exprParts.length - 1) {
    // for the sake of correctness, preserve backslashes not used to escape operators
    // (even though they will be removed in the next iteration)
    exprParts[i+1] = "\\" + exprParts[i+1];
   } else if (part == "expNotation") {
    // restore exponent notation
    result += "e";
   } else {
    // preserve and normalize operator, function, and constant names
    
    part = part.toLowerCase();
    if (part == "pi" || part == "e")
     part = part.toUpperCase();
    if (part == "roundto")
     part = "roundTo";
    if (part == "atantwo")
     part = "atan2";
    if (part == "logten")
     part = "log10";
    
    result += " " + part + " ";
   }
  } else {
   // strip non-calculation characters and replace 1 or >2 `=`s with `==`
   part = part.replace(/[^ ()0-9.,τπℯ√^~?:!<>=&|#%/*+-]+/g, "").replace(/=+/g, "==");
   part = part.replace(/([!<>])=+/g, "$1=");  // fix !=, <=, and >=
   
   // some aliases for constants and operators
   // (unary ^ -> not is defined by manipulating Parser.unaryOps in calculate())
   // (some extra constants and functions are also defined in calculate())
   part = part.replace(/\*\*([^*])/g, "^$1");  // ** -> ^ (power)
   part = part.replace(/~/g, " round ");
   part = part.replace(/&&/g, " and ");
   part = part.replace(/\|\|/g, " or ");  // || -> or
   part = part.replace(/##/g, "||");  // (string concatenation)
   part = part.replace(/#/g, " length ");  // (string) length
   part = part.replace(/√/g, " sqrt ");
   part = part.replace(/π/g, " PI ");
   part = part.replace(/ℯ/g, " E ");
   part = part.replace(/τ/g, "(2*PI)");
   part = part.replace(/\/\//g, " in ");  // `in` is redefined as int division above
   
   result += part;
  }
  isSymbol = !isSymbol;
 }
 
 return result;
}
