// undo depends on https://bugzilla.mozilla.org/show_bug.cgi?id=1220696 I think


(function() {
 // Easter Egg documentation:
 // If Ctrl+Alt+Shift+e (Ctrl+Alt+e for WebExt) is used to evaluate the value
 // of EGG_TRIGGER followed by the first element of one of the EGG_CASES, then
 // the second element will replace the selection.  Acting on the value of
 // EGG_SHORTCUT will autofill the value of EGG_TRIGGER.  Whitespace is ignored
 // for EGG_SHORTCUT and the EGG_CASES only.  The state will reset after the
 // egg is successfully executed, if a different string is evaluated, or if the
 // Shift key is not held.
 // Checkmate, Winston.
 var EGG_SHORTCUT = "\\oBrien";
 var EGG_TRIGGER = "O'Brien's SelectCalc";
 var EGG_CONFIRM = "SelectCalc:  O'Brien will answer the next question.";
 var EGG_CASES = [["2+2", "5"], ["2+2==5", "1"], ["2+2==4", "0"],
                  ["2+2!=5", "0"], ["2+2!=4", "1"],
                  ["6079", "Smith W"]];
 var previous = "";
 
 
 function callback(el, specialCases) {
  if (!(el instanceof HTMLElement)) return;
  if (!("selectionStart" in el && "selectionEnd" in el && "value" in el)) return;
  
  var expr = el.value.substring(el.selectionStart, el.selectionEnd);
  var result = null;
  var selectMode = "end";
  
  if (expr == EGG_TRIGGER || (previous == EGG_TRIGGER && expr == EGG_CONFIRM)) {
   previous = EGG_TRIGGER;
   expr = "";
   result = EGG_CONFIRM;
   selectMode = "select";
  } else {
   previous = "";
  }
  
  expr = sanitize(expr);
  
  var exprNoSpaces = expr.replace(/\s+/g, "");
  if (exprNoSpaces == EGG_SHORTCUT) {
   result = EGG_TRIGGER;
   selectMode = "select";
  } else if (specialCases && specialCases.length) {
   for (var i = 0; i < specialCases.length; i++) {
    var match = specialCases[i][0], replace = specialCases[i][1];
    if (exprNoSpaces == match) {
     result = replace;
     break;
    }
   }
  }
  
  if (result == null) {
   var D = Decimal;
   var parser = DecimalParser({ operators: { "in": true } });
   parser.unaryOps["^"] = parser.unaryOps["not"];
   parser.binaryOps["in"] = (a, b) => D(a).divToInt(b);  // aliased to `//` below
   result = String(parser.parse(expr).evaluate({
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
  
  el.setRangeText(result, el.selectionStart, el.selectionEnd, selectMode);
 }
 
 
 function sanitize(inExpr) {
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
    } else if (part == EGG_SHORTCUT.replace(/^\\/, "")) {
     // preserve the leading backslash of EGG_SHORTCUT
     result += "\\" + part;
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
    // (unary ^ -> not is defined by manipulating Parser.unaryOps in callback())
    // (some extra constants and functions are defined in callback())
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
 
 
 function DecimalParser(options) {
  if (typeof options != "object") options = {};
  let o = new exprEval.Parser(options);
  
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
  
  return o;
 }
 
 
 if (typeof browser == "object" && typeof browser.runtime == "object") {
  browser.runtime.onMessage.addListener(function(message) {
   if (message != "evaluate-selection") return;
   if (previous == EGG_TRIGGER)
    callback(document.activeElement, EGG_CASES);
   else
    callback(document.activeElement);
  });
 } else {
  document.addEventListener("keyup", function(e) {
   if (e.key.toLowerCase() == "e" && e.ctrlKey && e.altKey && !e.metaKey && !e.repeat) {
    if (!e.shiftKey) {
     callback(document.activeElement);
     previous = "";
    } else if (e.shiftKey) {
     if (previous == EGG_TRIGGER)
      callback(document.activeElement, EGG_CASES);
     else
      callback(document.activeElement);
    }
   }
  }, false);
 }
})();
