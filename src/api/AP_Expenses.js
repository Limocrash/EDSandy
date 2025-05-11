/**
 * AP_Expenses – single responsibility: write one row
 * keep it dumb & synchronous for now
 * - no CORS, no async, no promises, no nothing
 * version 2323.073.22 stardate: 20250511.1006
 */
var AP_Expenses = (function () {
  const SHEET_NAME = 'Form Responses 6 Backup';

  function addExpense(d) {
    const sh = SpreadsheetApp.getActiveSpreadsheet()
                             .getSheetByName(SHEET_NAME);

    sh.appendRow([
      new Date(d.date),            // assumes ms‑epoch from date input
      +d.amount || 0,
      d.category || '',
      d.subcategory || '',
      d.description || '',
      d.payMethod || '',
      (d.beneficiaries || []).join(',')   // "P001,P003"
    ]);

    return sh.getLastRow();        // row number (not used yet)
  }

  return { addExpense };
})();
