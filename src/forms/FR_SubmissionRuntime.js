/** FormSubmissionRuntime.gs
 * Shared runtime handler for all form submissions and DevTools reprocessing
 * Uses FORM_CONFIGS and shared utilities
 */

/**
 * Handles real-time form submission via Google Forms trigger
 * @param {GoogleAppsScript.Events.FormSubmit} e - Form event object
 * @param {Object} config - Form configuration object
 * @returns {Boolean} Success status
 */
function processFormSubmission(e, config) {
  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    const parsed = parseFields(itemResponses, config.fields);
    parsed.formSubmissionId = formResponse.getId();

    const result = validateFields(parsed, config.validation);
    if (result.errors.length > 0) {
      logValidationErrors({ ...parsed, validationErrors: result.errors });
      Logger.log("Validation errors: " + result.errors.join(", "));
      return false;
    }

    const row = buildRowData(result.data, config.sheetName);
    appendRowToSheet(row, config.sheetName);
    updateDashboard();
    Logger.log("Successfully submitted form for: " + parsed.description);
    return true;
  } catch (err) {
    Logger.log("Error in processFormSubmission: " + err.toString());
    return false;
  }
}

/**
 * Handles reprocessing of a single row from a form responses sheet manually
 * @param {Array} row - Raw row array from the form sheet
 * @param {Number} rowNumber - Row number (for logging or UI)
 * @param {Object} config - Form configuration object
 * @param {Number} index - Optional index for progress display
 * @param {Number} total - Optional total for progress display
 */
function processFormResponseRow(row, rowNumber, config, index, total) {
  try {
    const headers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1").getRange(1, 1, 1, row.length).getValues()[0];
    const formObject = {};
    headers.forEach((header, i) => {
      if (config.fields[header]) {
        formObject[config.fields[header]] = row[i];
      }
    });

    const result = validateFields(formObject, config.validation);
    if (result.errors.length > 0) {
      logValidationErrors({ ...formObject, validationErrors: result.errors });
      Logger.log(`Validation errors on row ${rowNumber}: ${result.errors.join(", ")}`);
      return false;
    }

    const rowData = buildRowData(result.data, config.sheetName);
    appendRowToSheet(rowData, config.sheetName, index, total);
    return true;
  } catch (err) {
    Logger.log("Error in processFormResponseRow on row " + rowNumber + ": " + err.toString());
    return false;
  }
}
