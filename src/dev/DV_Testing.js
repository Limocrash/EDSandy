/**
 * DV_Testing.js
 * 
 * Dev functions to validate key pieces of system config or behavior.
 * This one focuses on validating the current state of GLOBALS.
 */

/**
 * Verifies that all expected keys are present in the GLOBALS object
 * and logs any missing or empty values.
 */
function validateGlobals() {
  const expectedKeys = [
    "FORM_EXPENSE_ID",
    "FORM_LOAN_EXISTING_ID",
    "FORM_LOAN_NEW_ID",
    "FORM_REPAYMENT_ID",
    "BUDGIE_SITE_URL",
    "SCRIPT_WEBAPP_URL",
    "SPREADSHEET_ID"
  ];

  let issues = [];
  Logger.log("\n--- Validating GLOBALS ---");
  for (let i = 0; i < expectedKeys.length; i++) {
    const key = expectedKeys[i];
    const value = GLOBALS[key];
    if (!value || value.toString().trim() === "") {
      Logger.log(`❌ ${key} is missing or empty`);
      issues.push(key);
    } else {
      Logger.log(`✅ ${key}: ${value}`);
    }
  }

  if (issues.length > 0) {
    SpreadsheetApp.getUi().alert(`Missing or empty keys in GLOBALS: \n\n${issues.join("\n")}`);
  } else {
    SpreadsheetApp.getUi().alert("All expected GLOBALS are present and valid.");
  }
}

/**
 * Runs loadGlobals() and validateGlobals() in one click.
 */
function quickGlobalsCheck() {
  loadGlobals();
  validateGlobals();
}


