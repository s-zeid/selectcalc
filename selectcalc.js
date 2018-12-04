// ==UserScript==
// @name SelectCalc
// @namespace selectcalc@ns.bnay.me
// @match *://*/*
// @grant none
// ==/UserScript==

// undo depends on https://bugzilla.mozilla.org/show_bug.cgi?id=1220696 I think


(function() {
 // Easter Egg documentation:
 // If Ctrl+Alt+Shift+e (Ctrl+Alt+e for WebExt) is used to evaluate the value
 // of EGG_TRIGGER followed by the first element of one of the EGG_CASES, then
 // the second element will replace the selection.  Whitespace is ignored for
 // the EGG_CASES only.  The state will reset after the egg is successfully
 // executed, if a different string is evaluated, or if the Shift key is not
 // held.
 // Checkmate, Winston.
 var EGG_TRIGGER = "O'Brien's SelectCalc";
 var EGG_CASES = [["2+2", "5"], ["2+2==5", "1"], ["2+2==4", "0"],
                  ["6079", "Smith W"]];
 var previous = "";
 
 
 function callback(el, specialCases) {
  if (!(el instanceof HTMLElement)) return;
  if (!("selectionStart" in el && "selectionEnd" in el && "value" in el)) return;
  
  var expr = el.value.substring(el.selectionStart, el.selectionEnd);
  var result = null;
  
  if (expr == EGG_TRIGGER) {
   previous = expr;
   return;
  } else {
   previous = "";
  }
  
  // strip non-calculation characters and replace 1 or >2 `=`s with `==`
  expr = expr.replace(/[^()0-9.=/*+-]+/g, "").replace(/=+/g, "==");
  
  if (expr.match(/^[()0-9.=/*+-]+$/)) {
   if (specialCases && specialCases.length) {
    for (var i = 0; i < specialCases.length; i++) {
     var match = specialCases[i][0], replace = specialCases[i][1];
     if (expr == match) {
      result = replace;
      break;
     }
    }
   }
   
   if (result == null)
    // The actual calculation is done with eval().  I expect this to be safe
    // since, above, I am removing characters that could be used in an unsafe way.
    var result = String(Math.round(Number(eval(expr)) * 10e8) / 10e8);
   
   el.setRangeText(result, el.selectionStart, el.selectionEnd, "end");
  }
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
