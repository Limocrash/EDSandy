/**
 * Validation.gs
 * 
 * This script contains validation and lookup functions for the budget tracking system.
 */

/**
 * Generic lookup function for references in a sheet
 * @param {Sheet} sheet - The sheet to look up values in
 * @param {String} lookupValue - The value to look up
 * @param {Object} options - Configuration options
 * @param {Number} options.valueColumnIndex - Column index containing values to match against (default: 1)
 * @param {Number} options.idColumnIndex - Column index containing IDs to return (default: 0)
 * @param {String} options.activeColumnName - Name of column for IsActive flag (optional)
 * @param {Number} options.activeColumnIndex - Column index for IsActive flag (optional)
 * @param {Boolean} options.caseInsensitive - Whether to allow case-insensitive matching (default: true)
 * @param {Boolean} options.ignoreSpaces - Whether to ignore spaces in matching (default: true)
 * @param {Number} options.defaultId - Default ID to return if not found (default: 1)
 * @return {Number} The found ID or default ID
 */
function lookupReferenceId(sheet, lookupValue, options = {}) {
  // If no value to look up, return default
  if (!lookupValue) return options.defaultId || 1;
  
  // Set default options
  const config = {
    valueColumnIndex: 1,
    idColumnIndex: 0,
    activeColumnIndex: null,
    caseInsensitive: true,
    ignoreSpaces: true,
    defaultId: 1,
    ...options
  };
  
  try {
    Logger.log(`Looking up "${lookupValue}" in ${sheet.getName()}`);
    
    // Get sheet data
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Dynamic active column index if column name is provided
    if (typeof config.activeColumnName === 'string') {
      for (let i = 0; i < headers.length; i++) {
        if (headers[i] === config.activeColumnName) {
          config.activeColumnIndex = i;
          Logger.log(`Found ${config.activeColumnName} column at index: ${i}`);
          break;
        }
      }
    }
    
    Logger.log(`${sheet.getName()} has ${data.length} rows`);
    
    // Exact match
    for (let i = 1; i < data.length; i++) {
      const rowValue = data[i][config.valueColumnIndex];
      const rowActive = config.activeColumnIndex !== null ? data[i][config.activeColumnIndex] === true : true;
      
      if (rowValue === lookupValue && rowActive) {
        Logger.log(`Found exact match for "${lookupValue}" with ID: ${data[i][config.idColumnIndex]}`);
        return data[i][config.idColumnIndex];
      }
    }
    
    // Case-insensitive match
    if (config.caseInsensitive) {
      const lookupValueLower = String(lookupValue).toLowerCase();
      for (let i = 1; i < data.length; i++) {
        const rowValue = String(data[i][config.valueColumnIndex] || "");
        const rowValueLower = rowValue.toLowerCase();
        const rowActive = config.activeColumnIndex !== null ? data[i][config.activeColumnIndex] === true : true;
        
        if (rowValueLower === lookupValueLower && rowActive) {
          Logger.log(`Found case-insensitive match for "${lookupValue}" → "${rowValue}" with ID: ${data[i][config.idColumnIndex]}`);
          return data[i][config.idColumnIndex];
        }
      }
    }
    
    // Match ignoring spaces
    if (config.ignoreSpaces) {
      const lookupValueNoSpaces = String(lookupValue).replace(/\s+/g, '');
      for (let i = 1; i < data.length; i++) {
        const rowValue = String(data[i][config.valueColumnIndex] || "");
        const rowValueNoSpaces = rowValue.replace(/\s+/g, '');
        const rowActive = config.activeColumnIndex !== null ? data[i][config.activeColumnIndex] === true : true;
        
        if (rowValueNoSpaces === lookupValueNoSpaces && rowActive) {
          Logger.log(`Found match ignoring spaces for "${lookupValue}" → "${rowValue}" with ID: ${data[i][config.idColumnIndex]}`);
          return data[i][config.idColumnIndex];
        }
      }
    }
    
    // Log all values for debugging
    Logger.log(`Available values in ${sheet.getName()}:`);
    for (let i = 1; i < Math.min(data.length, 20); i++) {
      const rowActive = config.activeColumnIndex !== null ? data[i][config.activeColumnIndex] : true;
      Logger.log(`  - "${data[i][config.valueColumnIndex]}" (ID: ${data[i][config.idColumnIndex]}, Active: ${rowActive})`);
    }
    
    // If there are more rows than we logged, indicate that
    if (data.length > 20) {
      Logger.log(`  ... and ${data.length - 20} more rows`);
    }
    
    Logger.log(`Value "${lookupValue}" not found in ${sheet.getName()}. Using default ID: ${config.defaultId}`);
    return config.defaultId;
  } catch (error) {
    Logger.log(`Error in lookupReferenceId for ${sheet.getName()}: ${error.toString()}`);
    return config.defaultId;
  }
}

/**
 * Gets Category ID by name
 * @param {String} name - Category name
 * @return {Number} Category ID
 */
function getCategoryIdByName(name) {
  return lookupReferenceId(CATEGORIES_SHEET, name, {
    activeColumnName: "IsActive",
    defaultId: 1
  });
}

/**
 * Gets Payment Method ID by name
 * @param {String} name - Payment method name
 * @return {Number} Payment method ID
 */
function getPaymentMethodIdByName(name) {
  return lookupReferenceId(PAYMENT_METHODS_SHEET, name, {
    activeColumnName: "IsActive",
    defaultId: 1
  });
}

/**
 * Gets Person ID by name
 * @param {String} name - Person name
 * @return {Number} Person ID
 */
function getPersonIdByName(name) {
  return lookupReferenceId(PEOPLE_SHEET, name, {
    activeColumnName: "IsActive",
    defaultId: 1
  });
}

/**
 * Gets Loan Type ID by name
 * @param {String} name - Loan type name
 * @return {Number} Loan type ID
 */
function getLoanTypeIdByName(name) {
  return lookupReferenceId(LOAN_TYPE_SHEET, name, {
    defaultId: 1
  });
}

/**
 * Gets Account ID from Payment Method ID
 * @param {Number} paymentMethodId - Payment method ID
 * @return {Number} Account ID
 */
function getAccountIdFromPaymentMethod(paymentMethodId) {
  try {
    const data = PAYMENT_METHODS_SHEET.getDataRange().getValues();
    const headers = data[0];
    
    // Find the AccountID column index
    let accountIdColumnIndex = 2; // Default assumption
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === "AccountID") {
        accountIdColumnIndex = i;
        break;
      }
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === paymentMethodId) {
        return data[i][accountIdColumnIndex] || 1; // Return AccountID or default if null
      }
    }
    
    return 1; // Default account if not found
  } catch (error) {
    Logger.log("Error in getAccountIdFromPaymentMethod: " + error.toString());
    return 1;
  }
}

/**
 * Validates required lookup fields
 * @param {Object} data - Form data
 * @param {Array} validations - Validation rules
 * @return {Array} Validation errors
 */
function validateLookupFields(data, validations) {
  const errors = [];
  
  validations.forEach(validation => {
    const { field, value, lookupFunction, required, errorMessage } = validation;
    
    if (!value && required) {
      errors.push(`${field} is required`);
      return;
    }
    
    if (value) {
      const id = lookupFunction(value);
      
      // If the ID is the default and we don't want to accept defaults
      if (id === 1 && !validation.allowDefault) {
        errors.push(errorMessage || `${field} "${value}" not found`);
      }
      
      // Store the ID in the data object for later use
      data[field + 'Id'] = id;
    }
  });
  
  return errors;
}

/**
 * Validates data type for a value
 * @param {*} value - Value to validate
 * @param {String} expectedType - Expected data type
 * @param {Object} options - Additional options
 * @return {Boolean} Whether the value is valid
 */
function validateDataType(value, expectedType, options = {}) {
  if (value === null || value === undefined) {
    return !options.required;
  }
  
  switch (expectedType.toLowerCase()) {
    case 'number':
      return typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value));
    case 'string':
      return typeof value === 'string' || value.toString !== undefined;
    case 'date':
      return value instanceof Date || !isNaN(Date.parse(value));
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    case 'currency':
      return /^[0-9]+(\.[0-9]{1,2})?$/.test(String(value));
    default:
      return true;
  }
}

/**
 * Logs validation errors to a sheet for review
 * @param {Object} data - Data with validation errors
 */
function logValidationErrors(data) {
  try {
    // Get or create validation errors sheet
    let validationSheet = SPREADSHEET.getSheetByName("ValidationErrors");
    if (!validationSheet) {
      validationSheet = SPREADSHEET.insertSheet("ValidationErrors");
      validationSheet.appendRow([
        "Timestamp", 
        "FormSubmissionId", 
        "Description", 
        "Amount", 
        "Category", 
        "Payment Method",
        "Errors"
      ]);
      
      // Format headers
      validationSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#e0e0e0");
    }
    
    // Add error row
    validationSheet.appendRow([
      new Date(),
      data.formSubmissionId || "",
      data.description || "",
      data.amount || 0,
      data.categoryName || "",
      data.paymentMethodName || "",
      data.validationErrors.join("; ")
    ]);
    
    Logger.log("Logged validation errors: " + data.validationErrors.join(", "));
  } catch (error) {
    Logger.log("Error logging validation errors: " + error.toString());
  }
}

/**
 * Refreshes validation errors by reprocessing entries
 * @param {Number} startRow - First row to process (default: all)
 * @param {Number} endRow - Last row to process (default: all)
 */
function refreshValidationErrors() {
  try {
    // Get validation errors sheet
    const validationSheet = SPREADSHEET.getSheetByName("ValidationErrors");
    if (!validationSheet) {
      Logger.log("No validation errors sheet found");
      return;
    }
    
    const validationData = validationSheet.getDataRange().getValues();
    if (validationData.length <= 1) {
      Logger.log("No validation errors to process");
      return;
    }
    
    // Track which rows we've processed
    let processedCount = 0;
    let fixedCount = 0;
    
    // Process each validation error
    for (let i = 1; i < validationData.length; i++) {
      const row = validationData[i];
      const formSubmissionId = row[1];
      const description = row[2];
      
      if (!formSubmissionId) continue;
      
      // Find the corresponding form response
      const formResponsesSheet = SPREADSHEET.getSheetByName("Form Responses 1");
      if (!formResponsesSheet) continue;
      
      const formResponsesData = formResponsesSheet.getDataRange().getValues();
      let formResponseRow = -1;
      
      for (let j = 1; j < formResponsesData.length; j++) {
        if (formResponsesData[j][0] === formSubmissionId) {
          formResponseRow = j;
          break;
        }
      }
      
      if (formResponseRow === -1) continue;
      
      // Try to reprocess the form response
      const expenseData = {
        date: formResponsesData[formResponseRow][2] || new Date(),
        amount: parseFloat(formResponsesData[formResponseRow][1]) || 0,
        description: formResponsesData[formResponseRow][4] || "",
        categoryName: formResponsesData[formResponseRow][3] || "",
        paymentMethodName: formResponsesData[formResponseRow][5] || "",
        relatedToName: formResponsesData[formResponseRow][6] || "",
        location: formResponsesData[formResponseRow][7] || "",
        receiptImage: formResponsesData[formResponseRow][8] || null,
        formSubmissionId: formResponsesData[formResponseRow][0] || ""
      };
      
      const validationErrors = validateLookupFields(expenseData, [
        {
          field: "category",
          value: expenseData.categoryName,
          lookupFunction: getCategoryIdByName,
          required: true,
          allowDefault: true
        },
        {
          field: "paymentMethod",
          value: expenseData.paymentMethodName,
          lookupFunction: getPaymentMethodIdByName,
          required: true,
          allowDefault: true
        },
        {
          field: "relatedTo",
          value: expenseData.relatedToName,
          lookupFunction: getPersonIdByName,
          required: false,
          allowDefault: true
        }
      ]);
      
      processedCount++;
      
      // If no validation errors now, we can try to create the expense
      if (validationErrors.length === 0) {
        // Process response and create expense
        if (processFormResponseRow(formResponsesData[formResponseRow], formResponseRow + 1)) {
          // Mark the validation error as fixed
          validationSheet.getRange(i + 1, 7).setValue("FIXED: " + row[6]);
          fixedCount++;
        }
      }
    }
    
    Logger.log(`Processed ${processedCount} validation errors, fixed ${fixedCount}`);
    return `Processed ${processedCount} validation errors, fixed ${fixedCount}`;
  } catch (error) {
    Logger.log("Error refreshing validation errors: " + error.toString());
    return "Error: " + error.toString();
  }
}

/**
 * Fix common validation errors automatically
 */
function autoFixValidationErrors() {
  try {
    // Get validation errors sheet
    const validationSheet = SPREADSHEET.getSheetByName("ValidationErrors");
    if (!validationSheet) {
      Logger.log("No validation errors sheet found");
      return "No validation errors sheet found";
    }
    
    const validationData = validationSheet.getDataRange().getValues();
    if (validationData.length <= 1) {
      Logger.log("No validation errors to process");
      return "No validation errors to process";
    }
    
    // Common fixes based on error patterns
    const commonFixes = {
      // Payment method fixes
      "Cash - David": "Cash - David",
      "Cash David": "Cash - David",
      "CashDavid": "Cash - David",
      "Cash-David": "Cash - David",
      "Cash - Amor": "Cash - Amor",
      "Cash Amor": "Cash - Amor",
      "CashAmor": "Cash - Amor",
      "Cash-Amor": "Cash - Amor",
      
      // Category fixes
      "Groceries": "Groceries",
      "Food": "Groceries",
      "Shopping": "Groceries"
    };
    
    // Track our fixes
    let processedCount = 0;
    let fixedCount = 0;
    
    // Process each validation error
    for (let i = 1; i < validationData.length; i++) {
      const row = validationData[i];
      const errorText = row[6];
      
      // Skip already fixed errors
      if (errorText.startsWith("FIXED:")) continue;
      
      let fixed = false;
      
      // Payment method errors
      if (errorText.includes("Payment method") && errorText.includes("not found")) {
        const paymentMethodName = row[5];
        if (paymentMethodName && commonFixes[paymentMethodName]) {
          // Update the form responses sheet
          const formResponsesSheet = SPREADSHEET.getSheetByName("Form Responses 1");
          if (formResponsesSheet) {
            const formResponsesData = formResponsesSheet.getDataRange().getValues();
            
            for (let j = 1; j < formResponsesData.length; j++) {
              if (formResponsesData[j][5] === paymentMethodName) {
                formResponsesSheet.getRange(j + 1, 6).setValue(commonFixes[paymentMethodName]);
                fixed = true;
              }
            }
          }
        }
      }
      
      // Category errors
      if (errorText.includes("Category") && errorText.includes("not found")) {
        const categoryName = row[4];
        if (categoryName && commonFixes[categoryName]) {
          // Update the form responses sheet
          const formResponsesSheet = SPREADSHEET.getSheetByName("Form Responses 1");
          if (formResponsesSheet) {
            const formResponsesData = formResponsesSheet.getDataRange().getValues();
            
            for (let j = 1; j < formResponsesData.length; j++) {
              if (formResponsesData[j][3] === categoryName) {
                formResponsesSheet.getRange(j + 1, 4).setValue(commonFixes[categoryName]);
                fixed = true;
              }
            }
          }
        }
      }
      
      processedCount++;
      
      if (fixed) {
        validationSheet.getRange(i + 1, 7).setValue("AUTO-FIXED: " + errorText);
        fixedCount++;
      }
    }
    
    Logger.log(`Auto-processed ${processedCount} validation errors, fixed ${fixedCount}`);
    
    // If we fixed any, try to refresh validation errors
    if (fixedCount > 0) {
      refreshValidationErrors();
    }
    
    return `Auto-processed ${processedCount} validation errors, fixed ${fixedCount}`;
  } catch (error) {
    Logger.log("Error auto-fixing validation errors: " + error.toString());
    return "Error: " + error.toString();
  }
}