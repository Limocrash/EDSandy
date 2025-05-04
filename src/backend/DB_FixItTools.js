/**
 * DB_FixItTools.js
 *
 * Diagnostic and repair utilities for cleaning up and restoring
 * referential integrity and schema consistency across the Family Budget System
 * database (spreadsheet) backend.
 *
 * Domain: Backend – Repair & Maintenance
 */

/**
 * Fixes category mapping issues by assigning missing or invalid IDs
 * @return {Object} Summary of rows fixed and next available ID
 */
function fixCategoryMappingIssues() {
    initGlobals();
    const categoriesSheet = CATEGORIES_SHEET;
    const categoriesData = categoriesSheet.getDataRange().getValues();
    let fixedRows = 0;
    let nextAvailableId = 1;
  
    // Determine the next available ID
    for (let i = 1; i < categoriesData.length; i++) {
      const id = categoriesData[i][0];
      if (typeof id === 'number' && id >= nextAvailableId) {
        nextAvailableId = id + 1;
      }
    }
  
    // Assign new IDs where missing or invalid
    for (let i = 1; i < categoriesData.length; i++) {
      const id = categoriesData[i][0];
      const name = categoriesData[i][1];
  
      if (!name) continue; // skip blank rows
  
      if (id === '' || id === null || id === undefined || isNaN(id)) {
        categoriesSheet.getRange(i + 1, 1).setValue(nextAvailableId);
        nextAvailableId++;
        fixedRows++;
      }
    }
  
    return {
      success: true,
      message: `Fixed ${fixedRows} category ID issues.`,
      nextAvailableId
    };
  }
  
  /**
   * Verifies that all required sheets exist in the system
   * @return {Boolean} True if all required sheets are present
   */
  function checkDatabaseIntegrity() {
    initGlobals();
    const requiredSheets = [
      "Expenses", "Categories", "People", "Loans", "LoanTransactions",
      "PaymentMethods", "Accounts", "LoanTypes", "Relationships"
    ];
  
    const missingSheets = requiredSheets.filter(name => !SPREADSHEET.getSheetByName(name));
  
    if (missingSheets.length > 0) {
      Logger.log("CRITICAL: Missing required sheets: " + missingSheets.join(", "));
      return false;
    }
  
    Logger.log("Database structure: OK");
    return true;
  }
  