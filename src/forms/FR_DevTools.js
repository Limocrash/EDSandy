/** FormDevTools.gs
 * DevTools UI for batch processing form response rows manually
 * Prompts user for row range and invokes shared processing engine
 */

/**
 * Adds menu item for runBatchExpenseProcessing()
 */
(function() {
  CORE_Menu
    .addItem("Reprocess Expense Form Rows", "runBatchExpenseReprocessing")
});

/**
 * Prompts user for row range and reprocesses each using Form Engine
 */
function runBatchExpenseReprocessing() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt("Reprocess Rows", "Enter row range (e.g. 2–25):", ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const input = response.getResponseText();
  const match = input.match(/(\d+)\s*[-–]\s*(\d+)/); // Handles hyphen or en dash

  if (!match) {
    ui.alert("Invalid range format. Please use something like '2–25'.");
    return;
  }

  const start = parseInt(match[1]);
  const end = parseInt(match[2]);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const data = sheet.getRange(start, 1, end - start + 1, sheet.getLastColumn()).getValues();

  for (let i = 0; i < data.length; i++) {
    processFormResponseRow(data[i], start + i, FORM_CONFIGS.REGULAR_EXPENSE, i, data.length);
  }

  ui.alert(`Processed ${data.length} row(s) from ${start} to ${end}.`);
}
