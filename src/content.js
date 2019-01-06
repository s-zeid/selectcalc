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
  var output = null;
  var selectMode = "end";
  
  function onResponse(result) {
   var exprNoSpaces = expr.replace(/\s+/g, "");
   if (exprNoSpaces == EGG_SHORTCUT) {
    output = EGG_TRIGGER;
    selectMode = "select";
   } else if (specialCases && specialCases.length) {
    for (var i = 0; i < specialCases.length; i++) {
     var match = specialCases[i][0], replace = specialCases[i][1];
     if (exprNoSpaces == match) {
      output = replace;
      break;
     }
    }
   }
   
   if (output == null)
    output = result.value;
   
   el.setRangeText(output, el.selectionStart, el.selectionEnd, selectMode);
  }
  
  if (expr == EGG_TRIGGER || (previous == EGG_TRIGGER && expr == EGG_CONFIRM)) {
   previous = EGG_TRIGGER;
   expr = "";
   output = EGG_CONFIRM;
   selectMode = "select";
   onResponse({value: output, expr: expr});
  } else {
   previous = "";
   browser.runtime.sendMessage({
    command: "calculate",
    expr: expr,
    eggs: [EGG_SHORTCUT]
   }).then(onResponse, function onError(error) { console.error(error); });
  }
 }
 
 
 if (typeof browser == "object" && typeof browser.runtime == "object") {
  browser.runtime.onMessage.addListener(function(message) {
   if (message.command != "evaluate-selection") return;
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
