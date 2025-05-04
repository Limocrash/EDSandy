/** FormEngine.gs
 * Core form processing engine for all forms using FORM_CONFIGS
 * Handles row building, appending, and optional UI feedback
 */

/**
 * Builds a row array for the target sheet based on validated data
 * @param {Object} data - Validated and transformed form data
 * @param {String} sheetName - Target sheet name
 * @returns {Array} Row data array matching sheet structure
 */
function buildRowData(data, sheetName) {
  const now = new Date();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const newId = getNextId(sheet); // implement this helper based on your ID scheme
  const accountId = getAccountIdFromPaymentMethod(data.paymentMethodNameId);
  const personId = getPersonIdByName("Amor") || 2;

  return [
    newId,                         // ExpenseID
    data.TxnDate,                  // Date
    now,                           // Time
    data.amount,                   // Amount
    "PHP",                         // Currency
    "Regular Expense",             // TransactionType
    "",                            // RelatedLoanID
    data.categoryNameId,           // CategoryID
    data.subCategoryName,          // SubCategoryID or text
    data.paymentMethodNameId,      // PaymentMethodID
    accountId,                     // AccountID
    personId,                      // PersonID
    data.relatedToNameId || "",    // RelatedToPersonID
    data.description,              // Description
    "",                            // ReceiptImageURL — handled later if needed
    data.location || "",           // Location
    "Pending",                    // Status
    "Form",                       // EntryMethod
    data.formSubmissionId || "",   // FormSubmissionID
    now,                           // DateCreated
    now,                           // LastUpdated
    data.notes || ""               // Notes (appended to the end)
  ];
}

/**
 * Appends a row to a sheet and optionally updates progress
 * @param {Array} row - Built row array
 * @param {String} sheetName - Sheet to append to
 * @param {Number} index - (Optional) Current row index for progress counter
 * @param {Number} total - (Optional) Total rows being processed
 */
function appendRowToSheet(row, sheetName, index, total) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.appendRow(row);

  if (typeof index === 'number' && typeof total === 'number') {
    const ui = SpreadsheetApp.getUi();
    ui.showModelessDialog(HtmlService.createHtmlOutput(
      `<p style="font-family:Arial; font-size:14px;">Processing ${index + 1} of ${total} rows...</p>`
    ).setWidth(300).setHeight(100), 'Processing');
    Utilities.sleep(250);  // brief pause so UI can refresh
  }
}
