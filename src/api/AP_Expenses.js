/**
 * AP_Expenses.gs
 * Write‑side helpers (addExpense, future edit/remove)
 */
var AP_Expenses = (function () {

    /**
     * Adds one expense row to “Form Responses 6 Backup”.
     * Expects payload: {date,amount,category,subcategory,description,payMethod,beneficiaries?}
     * Returns {ok:true, expenseID:n}
     */
    function addExpense (data) {
      const sheet = SpreadsheetApp.getActive()
                      .getSheetByName('Form Responses 6 Backup');
  
      // --- TODO: validation / mapping ---
      sheet.appendRow([
        new Date(data.date),
        data.amount,
        data.category,
        data.subcategory,
        data.description,
        data.payMethod || '',
        (data.beneficiaries || []).join(',')   // CSV for now
      ]);
  
      return { ok:true, expenseID: sheet.getLastRow() };
    }
  
    return { addExpense };
  
  })();
  