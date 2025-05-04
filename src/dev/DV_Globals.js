/**
 * DV_GlobalsTool.js
 * 
 * Developer Utility to reload global values from Config sheet
 * and optionally log or verify the loaded data.
 */

function showGlobalsReloadTool() {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      "Reload Global Constants",
      "This will re-fetch all values from the Config sheet and populate the GLOBALS object. Proceed?",
      ui.ButtonSet.YES_NO
    );
  
    if (response === ui.Button.YES) {
      loadGlobals();
      Logger.log("GLOBALS loaded:");
      for (let key in GLOBALS) {
        Logger.log(`${key}: ${GLOBALS[key]}`);
      }
      ui.alert("Global variables reloaded successfully. Check the Apps Script log (View > Logs) for details.");
    } else {
      ui.alert("Operation cancelled.");
    }
  }
  
  // Add to Dev Tools menu (Optional)
  (function () {
    CORE_Menu.register(menu => {
      menu.addItem("Reload Globals from Config", "showGlobalsReloadTool");
  });
});
  