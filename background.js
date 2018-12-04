function evaluateSelection(tab) {
 var sendMessage = (tab) => browser.tabs.sendMessage(tab.id, "evaluate-selection");
 
 if (tab)
  sendMessage(tab);
 else {
  browser.tabs.query({
   currentWindow: true,
   active: true
  }).then(function(tabs) {
   for (let tab of tabs) {
    sendMessage(tab);
   }
  }).catch("onError");
 }
}


browser.commands.onCommand.addListener(function(command) {
 if (command != "evaluate-selection") return;
 evaluateSelection();
});


browser.contextMenus.create({
 id: "evaluate-selection",
 title: "SelectCalc",
 contexts: ["editable"]
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
 if (info.menuItemId == "evaluate-selection")
  evaluateSelection(tab);
});
