/**
 * DB_Diagnostics.js
 *
 * System diagnostics, environment checks, and runtime reports
 * for the backend spreadsheet structure of the Family Budget System.
 *
 * Domain: Backend – System Health & Integrity
 */

/**
 * Displays a status report of the database backend and recent activity
 */
function showSystemStatus() {
    try {
      initGlobals();
  
      const stats = {
        expensesCount: 0,
        lastExpenseDate: "None",
        receiptsWithoutLinks: 0,
        inconsistentReferences: [],
        sheetSizes: {}
      };
  
      // Count expenses
      const expensesData = EXPENSES_SHEET.getDataRange().getValues();
      stats.expensesCount = expensesData.length - 1;
  
      if (stats.expensesCount > 0) {
        let lastDate = new Date(0);
        for (let i = 1; i < expensesData.length; i++) {
          const d = new Date(expensesData[i][1]);
          if (d > lastDate) lastDate = d;
        }
        stats.lastExpenseDate = Utilities.formatDate(lastDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
  
      // Count broken receipt links
      let brokenLinks = 0;
      for (let i = 1; i < expensesData.length; i++) {
        const url = expensesData[i][14];
        if (url && url.includes("drive.google.com")) {
          const match = url.match(/\/d\/([^\/]+)/);
          if (match && match[1]) {
            try { DriveApp.getFileById(match[1]); } catch (e) { brokenLinks++; }
          }
        }
      }
      stats.receiptsWithoutLinks = brokenLinks;
  
      // Sheet sizes
      const sheets = SPREADSHEET.getSheets();
      for (let s of sheets) {
        stats.sheetSizes[s.getName()] = {
          rows: s.getLastRow(),
          cols: s.getLastColumn()
        };
      }
  
      // Reference integrity check
      stats.inconsistentReferences = findInconsistentReferences();
  
      // Load HTML template (should be in HTML folder as SystemStatusDialog.html)
      const html = HtmlService.createTemplateFromFile('SystemStatusDialog');
      html.stats = stats;
      SpreadsheetApp.getUi().showModalDialog(html.evaluate().setWidth(800).setHeight(600), 'System Status');
  
    } catch (err) {
      Logger.log("Error in showSystemStatus: " + err);
      SpreadsheetApp.getUi().alert("System status failed: " + err);
    }
  }
  
  /**
   * Finds referential inconsistencies across known sheets (IDs vs Lookups)
   */
  function findInconsistentReferences() {
    const issues = [];
  
    // Validate Categories in Expenses
    const expenses = EXPENSES_SHEET.getDataRange().getValues();
    const categories = CATEGORIES_SHEET.getDataRange().getValues();
    const validCatIds = new Set(categories.slice(1).map(r => r[0]));
  
    const invalidCatRefs = expenses.slice(1).filter(r => r[7] && !validCatIds.has(r[7])).map(r => r[0]);
    if (invalidCatRefs.length)
      issues.push({ type: "Invalid Category Reference", ids: invalidCatRefs });
  
    // Validate Payment Methods
    const payMethods = PAYMENT_METHODS_SHEET.getDataRange().getValues();
    const validPMIds = new Set(payMethods.slice(1).map(r => r[0]));
    const invalidPMRefs = expenses.slice(1).filter(r => r[9] && !validPMIds.has(r[9])).map(r => r[0]);
    if (invalidPMRefs.length)
      issues.push({ type: "Invalid Payment Method Reference", ids: invalidPMRefs });
  
    // Validate Person IDs
    const people = PEOPLE_SHEET.getDataRange().getValues();
    const validPersonIds = new Set(people.slice(1).map(r => r[0]));
    const loans = SPREADSHEET.getSheetByName("Loans")?.getDataRange().getValues() || [];
    const loanIssues = loans.slice(1).filter(r => !validPersonIds.has(r[3]) || !validPersonIds.has(r[4])).map(r => r[0]);
  
    if (loanIssues.length)
      issues.push({ type: "Invalid Person Reference in Loans", ids: loanIssues });
  
    return issues;
  }
  
  /**
   * Checks that all required form triggers are in place
   */
  function diagnoseFormTriggers() {
    const triggers = ScriptApp.getProjectTriggers();
    const required = [
      "onExpenseFormSubmit",
      "onExistingBorrowerLoanFormSubmit",
      "onNewBorrowerLoanFormSubmit",
      "onLoanRepaymentFormSubmit"
    ];
  
    const missing = required.filter(name => !triggers.some(t => t.getHandlerFunction() === name));
    if (missing.length > 0) {
      Logger.log("Missing Triggers: " + missing.join(", "));
      return false;
    }
    Logger.log("All required triggers present.");
    return true;
  }
  