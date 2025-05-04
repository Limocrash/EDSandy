/**
 * DevTools.gs
 * Shows dialog to select which form responses to process or reprocess
 */
function showProcessingDialog() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h3 { margin-top: 0; }
      .form-group { margin-bottom: 15px; }
      .tabs { display: flex; margin-bottom: 20px; }
      .tab { padding: 8px 15px; cursor: pointer; border: 1px solid #ccc; }
      .tab.active { background-color: #4285f4; color: white; }
      .tab-content { display: none; }
      .tab-content.active { display: block; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input[type="number"] { width: 60px; }
      .button { background-color: #4285f4; color: white; border: none; padding: 8px 16px; cursor: pointer; }
      .progress-container { margin-top: 20px; display: none; }
      .progress-bar { height: 20px; background-color: #e0e0e0; border-radius: 4px; margin-bottom: 10px; overflow: hidden; }
      .progress-fill { height: 100%; width: 0%; background-color: #4285f4; transition: width 0.3s; }
      .log-container { 
        margin-top: 15px; 
        max-height: 150px; 
        overflow-y: auto; 
        border: 1px solid #e0e0e0; 
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        background-color: #f9f9f9;
      }
    </style>
    
    <h3>Form Response Processing</h3>
    
    <div class="tabs">
      <div class="tab active" onclick="showTab('reprocess')">Reprocess Entries</div>
      <div class="tab" onclick="showTab('delete')">Delete & Recreate</div>
    </div>
    
    <div id="reprocess" class="tab-content active">
      <div class="form-group">
        <label for="startRow">Start Row:</label>
        <input type="number" id="startRow" value="2" min="2">
      </div>
      <div class="form-group">
        <label for="endRow">End Row:</label>
        <input type="number" id="endRow" value="3" min="2">
      </div>
      <button class="button" id="reprocessButton" onclick="processRows('reprocess')">Reprocess Rows</button>
    </div>
    
    <div id="delete" class="tab-content">
      <div class="form-group">
        <label for="deleteRow">Row to Delete & Recreate:</label>
        <input type="number" id="deleteRow" value="2" min="2">
      </div>
      <div class="form-group">
        <label for="expenseId">Expense ID to Delete (if known):</label>
        <input type="number" id="expenseId" placeholder="Optional">
      </div>
      <button class="button" id="deleteButton" onclick="processRows('delete')">Delete & Recreate</button>
    </div>
    
    <div id="progressContainer" class="progress-container">
      <div class="progress-bar">
        <div id="progressFill" class="progress-fill"></div>
      </div>
      <div id="progressText">Processing row 0 of 0...</div>
    </div>
    
    <div id="logContainer" class="log-container" style="display:none;">
      <div id="logEntries"></div>
    </div>
    
    <div id="result" style="margin-top: 15px;"></div>
    
    <script>
      function showTab(tabName) {
        // Hide all tabs
        const tabs = document.getElementsByClassName('tab');
        for (let i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove('active');
        }
        
        const tabContents = document.getElementsByClassName('tab-content');
        for (let i = 0; i < tabContents.length; i++) {
          tabContents[i].classList.remove('active');
        }
        
        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        document.querySelector('.tab[onclick="showTab(\\''+tabName+'\\')"]').classList.add('active');
      }
      
      function processRows(action) {
        let params = {};
        document.getElementById('logContainer').style.display = 'block';
        document.getElementById('logEntries').innerHTML = '';
        addLog('Starting processing...');
        
        if (action === 'reprocess') {
          params.startRow = parseInt(document.getElementById('startRow').value);
          params.endRow = parseInt(document.getElementById('endRow').value);
          document.getElementById('reprocessButton').disabled = true;
          document.getElementById('progressContainer').style.display = 'block';
          document.getElementById('progressText').textContent = 'Preparing to process rows ' + params.startRow + ' to ' + params.endRow + '...';
          document.getElementById('progressFill').style.width = '0%';
        } else if (action === 'delete') {
          params.row = parseInt(document.getElementById('deleteRow').value);
          params.expenseId = document.getElementById('expenseId').value || null;
          document.getElementById('deleteButton').disabled = true;
          document.getElementById('progressContainer').style.display = 'block';
          document.getElementById('progressText').textContent = 'Deleting and recreating row ' + params.row + '...';
          document.getElementById('progressFill').style.width = '0%';
        }
        
        google.script.run
          .withSuccessHandler(function(result) {
            if (action === 'reprocess') {
              document.getElementById('reprocessButton').disabled = false;
            } else {
              document.getElementById('deleteButton').disabled = false;
            }
            document.getElementById('result').innerHTML = result.message;
            document.getElementById('progressFill').style.width = '100%';
            document.getElementById('progressText').textContent = 'Completed!';
            addLog('Finished processing');
          })
          .withFailureHandler(function(error) {
            if (action === 'reprocess') {
              document.getElementById('reprocessButton').disabled = false;
            } else {
              document.getElementById('deleteButton').disabled = false;
            }
            document.getElementById('result').innerHTML = "Error: " + error;
            document.getElementById('progressText').textContent = 'Error occurred!';
            addLog('ERROR: ' + error);
          })
          .withUserObject(this)
          .processFormResponses(action, params);
      }
      
      function updateProgress(data) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const total = data.total;
        const current = data.current;
        const percentComplete = Math.round((current / total) * 100);
        
        progressFill.style.width = percentComplete + '%';
        progressText.textContent = 'Processing row ' + current + ' of ' + total + ' (' + percentComplete + '%)';
        addLog('Processing row ' + current + ' - ' + data.description);
      }
      
      function addLog(message) {
        const logEntries = document.getElementById('logEntries');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.textContent = timestamp + ': ' + message;
        logEntries.appendChild(logEntry);
        logEntries.scrollTop = logEntries.scrollHeight;
      }
      
      // Register the callback for progress updates
      google.script.run.withSuccessHandler(updateProgress).getCallbackObject();
    </script>
  `)
    .setWidth(500)
    .setHeight(500)
    .setTitle('Form Response Processing');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Form Response Processing');
}

/**
 * Processes form responses based on action and parameters
 * @param {String} action - 'reprocess' or 'delete'
 * @param {Object} params - Parameters for the action
 * @return {Object} Result message and status
 */
function processFormResponses(action, params) {
  try {
    // Initialize sheet references
    SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
    CATEGORIES_SHEET = SPREADSHEET.getSheetByName("Categories");
    PAYMENT_METHODS_SHEET = SPREADSHEET.getSheetByName("PaymentMethods");
    PEOPLE_SHEET = SPREADSHEET.getSheetByName("People");
    ACCOUNTS_SHEET = SPREADSHEET.getSheetByName("Accounts");
    
    // Get Form Responses data
    const formResponsesSheet = SPREADSHEET.getSheetByName("Form Responses 1");
    if (!formResponsesSheet) {
      return {success: false, message: "Error: Form Responses 1 sheet not found"};
    }
    
    const data = formResponsesSheet.getDataRange().getValues();
    
    if (action === 'reprocess') {
      return reprocessRows(formResponsesSheet, data, params.startRow, params.endRow);
    } else if (action === 'delete') {
      return deleteAndRecreate(formResponsesSheet, data, params.row, params.expenseId);
    } else {
      return {success: false, message: "Unknown action: " + action};
    }
  } catch (error) {
    Logger.log("Error in processFormResponses: " + error.toString());
    return {success: false, message: "Error: " + error.toString()};
  }
}

/**
 * Creates a global callback object for progress updates
 * This is a workaround for Google Apps Script's limitation on
 * continuous client-server communication
 */
var CALLBACK_FUNCTION = null;

/**
 * Gets the callback object for progress updates
 * @return {Object} An empty object that the client can use to register a callback
 */
function getCallbackObject() {
  // This function doesn't actually do anything by itself
  // It just gives us a way to get a reference to the client-side callback function
  return {};
}

/**
 * Updates the UI with progress information
 * @param {Number} current - Current row being processed
 * @param {Number} total - Total rows to process
 * @param {String} description - Description of the current item
 */
function updateProgressUI(current, total, description) {
  if (CALLBACK_FUNCTION) {
    try {
      CALLBACK_FUNCTION.withSuccessHandler(function(){}).updateProgress({
        current: current,
        total: total,
        description: description
      });
    } catch(e) {
      Logger.log("Error updating progress: " + e.toString());
    }
  }
}

/**
 * Reprocesses form response rows
 * @param {Sheet} sheet - Form responses sheet
 * @param {Array} data - Sheet data
 * @param {Number} startRow - First row to process
 * @param {Number} endRow - Last row to process
 * @return {Object} Result message and status
 */
function reprocessRows(sheet, data, startRow, endRow) {
  let processedCount = 0;
  const total = Math.min(endRow - startRow + 1, data.length - startRow + 1);
  
  // Register the running function as the callback target
  CALLBACK_FUNCTION = this;
  
  Logger.log("Starting reprocessing of rows " + startRow + " to " + endRow);
  
  // Process the specified rows
  for (let rowIndex = startRow - 1; rowIndex < endRow; rowIndex++) {
    if (rowIndex >= data.length) {
      break;
    }
    
    const current = rowIndex - startRow + 2;
    const description = data[rowIndex][4] || "Row " + (rowIndex + 1); // Use Description field or row number
    
    // Update progress UI
    updateProgressUI(current, total, description);
    
    // Process the row and create expense entry
    if (processFormResponseRow(data[rowIndex], rowIndex + 1)) {
      processedCount++;
      Logger.log("Successfully processed row " + (rowIndex + 1) + ": " + description);
    } else {
      Logger.log("Failed to process row " + (rowIndex + 1) + ": " + description);
    }
    
    // Add a small delay to avoid hitting quotas and to make progress visible
    Utilities.sleep(200);
  }
  
  return {
    success: true, 
    message: "Successfully reprocessed " + processedCount + " of " + total + " expense entries."
  };
}

/**
 * Deletes an expense entry and recreates it from form response
 * @param {Sheet} sheet - Form responses sheet
 * @param {Array} data - Sheet data
 * @param {Number} row - Row to process
 * @param {Number} expenseId - Expense ID to delete (optional)
 * @return {Object} Result message and status
 */
function deleteAndRecreate(sheet, data, row, expenseId) {
  // Register the running function as the callback target
  CALLBACK_FUNCTION = this;
  
  updateProgressUI(1, 3, "Deleting expense");
  
  // Find and delete the expense entry
  let deleteSuccess = false;
  if (expenseId) {
    // Delete by ID if provided
    const expensesData = EXPENSES_SHEET.getDataRange().getValues();
    for (let i = 1; i < expensesData.length; i++) {
      if (expensesData[i][0] === Number(expenseId)) {
        EXPENSES_SHEET.deleteRow(i + 1);
        Logger.log("Deleted expense with ID: " + expenseId);
        deleteSuccess = true;
        break;
      }
    }
    
    if (!deleteSuccess) {
      return {
        success: false, 
        message: "Could not find expense with ID: " + expenseId
      };
    }
  } else {
    return {
      success: false, 
      message: "To delete an entry, please provide the Expense ID."
    };
  }
  
  updateProgressUI(2, 3, "Processing row data");
  
  // Process the row to recreate the expense
  if (row < 1 || row >= data.length) {
    return {
      success: false, 
      message: "Row " + row + " is out of range"
    };
  }
  
  const description = data[row - 1][4] || "Row " + row;
  updateProgressUI(3, 3, "Creating new expense: " + description);
  
  if (processFormResponseRow(data[row - 1], row)) {
    return {
      success: true, 
      message: "Successfully deleted and recreated expense entry from row " + row + "."
    };
  } else {
    return {
      success: false, 
      message: "Failed to recreate expense entry from row " + row + "."
    };
  }
}

/**
 * Processes a single form response row
 * @param {Array} row - Row data
 * @param {Number} rowNumber - Row number for logging
 * @return {Boolean} Success
 */
function processFormResponseRow(row, rowNumber) {
  try {
    // Adjust these indices to match your form responses columns
    const timestampIndex = 0;     // Timestamp
    const amountIndex = 1;        // Amount
    const dateIndex = 2;          // Date
    const categoryIndex = 3;      // Category
    const descriptionIndex = 4;   // Description
    const paymentMethodIndex = 5; // Payment Method
    const relatedToIndex = 6;     // Related To
    const locationIndex = 7;      // Location
    const receiptIndex = 8;       // Photo of Receipt
    
    Logger.log("Processing row " + rowNumber + ": " + (row[descriptionIndex] || "No description"));
    
    // Create an expense object from the row data
    let expenseData = {
      timestamp: row[timestampIndex],
      date: row[dateIndex],
      amount: row[amountIndex],
      description: row[descriptionIndex],
      categoryName: row[categoryIndex],
      paymentMethodName: row[paymentMethodIndex],
      relatedToName: row[relatedToIndex],
      location: row[locationIndex],
      receiptImage: row[receiptIndex]
    };
    
    // Process receipt image if present
    let receiptUrl = "";
    if (expenseData.receiptImage) {
      try {
        // Extract file ID from the URL if it's a link
        if (typeof expenseData.receiptImage === 'string' && expenseData.receiptImage.includes('id=')) {
          const matches = expenseData.receiptImage.match(/id=([^&]+)/);
          if (matches && matches[1]) {
            const fileId = matches[1];
            receiptUrl = processReceiptImage(fileId, expenseData.date, expenseData.description);
          } else {
            receiptUrl = expenseData.receiptImage; // Keep original URL
          }
        } else {
          receiptUrl = expenseData.receiptImage;
        }
        Logger.log("Receipt URL processed: " + receiptUrl.substring(0, 50) + "...");
      } catch (error) {
        Logger.log("Error processing receipt image: " + error.toString());
        receiptUrl = "Error: " + error.toString();
      }
    }
    
    // Look up IDs for foreign keys
    let categoryId = 1;
    try {
      categoryId = getCategoryIdByName(expenseData.categoryName);
      Logger.log("Category lookup: " + expenseData.categoryName + " -> ID " + categoryId);
    } catch (error) {
      Logger.log("Error looking up category ID: " + error.toString());
    }
    
    let paymentMethodId = 1;
    try {
      paymentMethodId = getPaymentMethodIdByName(expenseData.paymentMethodName);
      Logger.log("Payment method lookup: " + expenseData.paymentMethodName + " -> ID " + paymentMethodId);
    } catch (error) {
      Logger.log("Error looking up payment method ID: " + error.toString());
    }
    
    let personId = 2; // Default to Amor
    try {
      personId = getPersonIdByName("Amor");
      Logger.log("Person ID for Amor: " + personId);
    } catch (error) {
      Logger.log("Error looking up person ID: " + error.toString());
    }
    
    let relatedPersonId = "";
    if (expenseData.relatedToName) {
      try {
        relatedPersonId = getPersonIdByName(expenseData.relatedToName);
        Logger.log("Related person lookup: " + expenseData.relatedToName + " -> ID " + relatedPersonId);
      } catch (error) {
        Logger.log("Error looking up related person ID: " + error.toString());
      }
    }
    
    // Get account ID from payment method
    let accountId = 1;
    try {
      accountId = getAccountIdFromPaymentMethod(paymentMethodId);
      Logger.log("Account ID from payment method: " + paymentMethodId + " -> " + accountId);
    } catch (error) {
      Logger.log("Error looking up account ID: " + error.toString());
    }
    
    // Generate new expense ID
    const newExpenseId = getNextId(EXPENSES_SHEET);
    Logger.log("New Expense ID: " + newExpenseId);
    
    // Current date/time for timestamps
    const now = new Date();
    
    // Add expense to the sheet
    EXPENSES_SHEET.appendRow([
      newExpenseId,                        // 1. ExpenseID
      expenseData.date,                    // 2. Date
      expenseData.timestamp,               // 3. Time
      expenseData.amount,                  // 4. Amount
      "PHP",                               // 5. Currency
      "Regular Expense",                   // 6. TransactionType
      "",                                  // 7. RelatedLoanID
      categoryId,                          // 8. CategoryID
      "",                                  // 9. SubCategoryID
      paymentMethodId,                     // 10. PaymentMethodID
      accountId,                           // 11. AccountID
      personId,                            // 12. PersonID
      relatedPersonId,                     // 13. RelatedToPersonID
      expenseData.description,             // 14. Description
      receiptUrl,                          // 15. ReceiptImageURL
      expenseData.location,                // 16. Location
      "Pending",                           // 17. Status
      "Form (Reprocessed)",                // 18. EntryMethod
      "Row " + rowNumber,                  // 19. FormSubmissionID
      now,                                 // 20. DateCreated
      now                                  // 21. LastUpdated
    ]);
    
    Logger.log("Successfully processed row " + rowNumber + ": " + expenseData.description);
    return true;
  } catch (error) {
    Logger.log("Error processing row " + rowNumber + ": " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    return false;
  }
}

/**
 * Shows enhanced system status dialog
 */
function showSystemStatus() {
  try {
    // Initialize sheet references if needed
    if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    
    // Gather system statistics
    const stats = {
      expensesCount: 0,
      activeLoansCount: 0,
      categoriesCount: 0,
      peopleCount: 0,
      lastExpenseDate: "None",
      lastLoanDate: "None",
      validationErrorsCount: 0,
      receiptsWithoutLinks: 0,
      inconsistentReferences: [],
      sheetSizes: {}
    };
    
    // Count expenses
    const expensesSheet = SPREADSHEET.getSheetByName("Expenses");
    if (expensesSheet) {
      const expensesData = expensesSheet.getDataRange().getValues();
      stats.expensesCount = expensesData.length - 1;
      if (stats.expensesCount > 0) {
        // Find last expense date
        let lastDate = new Date(0);
        for (let i = 1; i < expensesData.length; i++) {
          const expenseDate = new Date(expensesData[i][1]);
          if (expenseDate > lastDate) {
            lastDate = expenseDate;
          }
        }
        stats.lastExpenseDate = Utilities.formatDate(lastDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      // Check for receipt links without files
      let brokenReceiptLinks = 0;
      for (let i = 1; i < expensesData.length; i++) {
        const receiptUrl = expensesData[i][14];
        if (receiptUrl && receiptUrl.includes("drive.google.com")) {
          try {
            // Extract file ID from Drive URL
            const match = receiptUrl.match(/\/d\/([^\/]*)/);
            if (match && match[1]) {
              const fileId = match[1];
              try {
                DriveApp.getFileById(fileId);
              } catch (e) {
                brokenReceiptLinks++;
              }
            }
          } catch (e) {
            // Skip any errors in checking
          }
        }
      }
      stats.receiptsWithoutLinks = brokenReceiptLinks;
    }
    
    // Add all your other stats collection code here...
    // ...
    
    // Find inconsistent references
    stats.inconsistentReferences = findInconsistentReferences(SPREADSHEET);
    
    // Get sheet sizes
    const sheets = SPREADSHEET.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const name = sheet.getName();
      const rows = sheet.getLastRow();
      const cols = sheet.getLastColumn();
      stats.sheetSizes[name] = { rows, cols };
    }
    
    // Create HTML template and pass data
    const htmlTemplate = HtmlService.createTemplateFromFile('SystemStatusDialog');
    htmlTemplate.stats = stats;
    
    // Evaluate template and show dialog
    const html = htmlTemplate.evaluate()
      .setWidth(800)
      .setHeight(600)
      .setTitle('Family Budget System Status');
    
    SpreadsheetApp.getUi().showModalDialog(html, 'System Status');
    
  } catch (error) {
    Logger.log("Error showing system status: " + error.toString());
    SpreadsheetApp.getUi().alert("Error showing system status: " + error.toString());
  }
}

/**
 * Finds inconsistent references in the database
 * @param {Spreadsheet} ss - The spreadsheet to check
 * @return {Array} Array of inconsistency issues
 */
function findInconsistentReferences(ss) {
  const issues = [];
  
  try {
    // Check for expense category references
    const expensesSheet = ss.getSheetByName("Expenses");
    const categoriesSheet = ss.getSheetByName("Categories");
    
    if (expensesSheet && categoriesSheet) {
      const expensesData = expensesSheet.getDataRange().getValues();
      const categoriesData = categoriesSheet.getDataRange().getValues();
      
      // Build set of valid category IDs
      const validCategoryIds = new Set();
      for (let i = 1; i < categoriesData.length; i++) {
        validCategoryIds.add(categoriesData[i][0]);
      }
      
      // Check expense categories
      const invalidCategories = [];
      for (let i = 1; i < expensesData.length; i++) {
        const categoryId = expensesData[i][7];
        if (categoryId && !validCategoryIds.has(categoryId)) {
          invalidCategories.push(expensesData[i][0]); // ExpenseID
        }
      }
      
      if (invalidCategories.length > 0) {
        issues.push({
          type: "Invalid Category Reference",
          description: "Expenses referencing non-existent categories",
          ids: invalidCategories
        });
      }
    }
    
    // Check for expense payment method references
    const paymentMethodsSheet = ss.getSheetByName("PaymentMethods");
    if (expensesSheet && paymentMethodsSheet) {
      const expensesData = expensesSheet.getDataRange().getValues();
      const paymentMethodsData = paymentMethodsSheet.getDataRange().getValues();
      
      // Build set of valid payment method IDs
      const validPaymentMethodIds = new Set();
      for (let i = 1; i < paymentMethodsData.length; i++) {
        validPaymentMethodIds.add(paymentMethodsData[i][0]);
      }
      
      // Check expense payment methods
      const invalidPaymentMethods = [];
      for (let i = 1; i < expensesData.length; i++) {
        const paymentMethodId = expensesData[i][9];
        if (paymentMethodId && !validPaymentMethodIds.has(paymentMethodId)) {
          invalidPaymentMethods.push(expensesData[i][0]); // ExpenseID
        }
      }
      
      if (invalidPaymentMethods.length > 0) {
        issues.push({
          type: "Invalid Payment Method Reference",
          description: "Expenses referencing non-existent payment methods",
          ids: invalidPaymentMethods
        });
      }
    }
    
    // Check for loan borrower/lender references
    const loansSheet = ss.getSheetByName("Loans");
    const peopleSheet = ss.getSheetByName("People");
    
    if (loansSheet && peopleSheet) {
      const loansData = loansSheet.getDataRange().getValues();
      const peopleData = peopleSheet.getDataRange().getValues();
      
      // Build set of valid person IDs
      const validPersonIds = new Set();
      for (let i = 1; i < peopleData.length; i++) {
        validPersonIds.add(peopleData[i][0]);
      }
      
      // Check loan people references
      const invalidLoanPeople = [];
      for (let i = 1; i < loansData.length; i++) {
        const lenderId = loansData[i][3];
        const borrowerId = loansData[i][4];
        
        if ((lenderId && !validPersonIds.has(lenderId)) || 
            (borrowerId && !validPersonIds.has(borrowerId))) {
          invalidLoanPeople.push(loansData[i][0]); // LoanID
        }
      }
      
      if (invalidLoanPeople.length > 0) {
        issues.push({
          type: "Invalid Person Reference",
          description: "Loans referencing non-existent people",
          ids: invalidLoanPeople
        });
      }
    }
    
    return issues;
  } catch (error) {
    Logger.log("Error finding inconsistent references: " + error.toString());
    return [{
      type: "Error",
      description: "Error checking references: " + error.toString(),
      ids: []
    }];
  }
}

/**
 * Run a specific system action based on user input from System Status dialog
 * @param {String} action - Action to run
 * @return {String} Result message
 */
function runSystemAction(action) {
  try {
    switch(action) {
      case "updateFormDropdowns":
        updateFormDropdowns();
        return "Form dropdowns updated successfully";
        
      case "setupDataValidation":
        setupDataValidation();
        return "Data validation rules set up successfully";
        
      case "generateSchema":
        generateSchema();
        return "Schema generated successfully";
        
      case "processRecurringTransactions":
        const processed = processRecurringTransactions();
        return `Processed ${processed} recurring transactions`;
        
      case "setupRecurringTransactionsTrigger":
        setupRecurringTransactionsTrigger();
        return "Daily trigger for recurring transactions set up successfully";
        
      case "updateDashboard":
        updateDashboard();
        return "Dashboard updated successfully";
        
      case "fixBrokenReceipts":
        // Placeholder for future implementation
        return "Receipt link fixing feature not yet implemented";
        
      case "cleanupValidationErrors":
        // Placeholder for future implementation
        return "Validation errors cleanup feature not yet implemented";
        
      case "fixReferentialIntegrity":
        // Placeholder for future implementation
        return "Referential integrity fixing feature not yet implemented";
        
      default:
        return "Unknown action: " + action;
    }
  } catch (error) {
    Logger.log("Error running system action: " + error.toString());
    return "Error: " + error.toString();
  }
}

/** listFunctionNames()
 * 
 * DEVTOOLS FUNCTION LISTING TOOL 
 * Creates a list of functions in a .gs file
*/
// This function lists all functions in the current project 
// and logs them to the console
// It uses a regex to find function definitions in the code
// Note: This function only works in the context of a Google Apps Script project
// and will not work in a standalone script or other environments
function listFunctionNames() {
  const files = ScriptApp.getProjectFiles(); // Get all files in the project
  const functionNames = [];
  const functionRegex = /^\s*function\s+(\w+)\s*\(/gm; // Regex to match function definitions

  // Iterate through all files in the project
  while (files.hasNext()) {
    const file = files.next();
    if (file.getType() === ScriptApp.FileType.SERVER_JS) { // Only process .gs files
      const content = file.getContent(); // Get the file content
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        functionNames.push(match[1]); // Add the function name to the list
      }
    }
  }

  // Log results
  Logger.log('Functions found (%s):\n%s', functionNames.length, functionNames.join('\n'));

  return functionNames; // Return the list of function names
}

/** checkDatabaseIntegrity() 
 * This function analyzes the active spreadsheet for a list of required sheets (const requiredSheets) for a
 * given project and returns errors for any and all missing sheet names. Returns "Database structure: OK"if
 * no missing tables are found.
 */
function checkDatabaseIntegrity() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = ["Expenses", "Categories", "People", "Loans", "LoanTransactions", 
                         "PaymentMethods", "Accounts", "LoanTypes", "Relationships"];
  
  let missingSheets = [];
  
  requiredSheets.forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      missingSheets.push(sheetName);
    }
  });
  
  if (missingSheets.length > 0) {
    Logger.log("CRITICAL ERROR: Missing required sheets: " + missingSheets.join(", "));
    return false;
  }
  
  Logger.log("Database structure: OK");
  return true;
}

/** diagnoseDashboardData()
 * Tests all dashboard data access functions and reports results to help identify
 * where data access is failing in the WebApp.gs functions
 * @return {Boolean} True if all tests pass, false if any fail
 */
function diagnoseDashboardData() {
  try {
    // Initialize necessary sheets
    if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    if (!EXPENSES_SHEET) EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
    if (!CATEGORIES_SHEET) CATEGORIES_SHEET = SPREADSHEET.getSheetByName("Categories");
    if (!LOANS_SHEET) LOANS_SHEET = SPREADSHEET.getSheetByName("Loans");
    if (!PEOPLE_SHEET) PEOPLE_SHEET = SPREADSHEET.getSheetByName("People");
    if (!LOAN_TRANSACTIONS_SHEET) LOAN_TRANSACTIONS_SHEET = SPREADSHEET.getSheetByName("LoanTransactions");
    if (!PAYMENT_METHODS_SHEET) PAYMENT_METHODS_SHEET = SPREADSHEET.getSheetByName("PaymentMethods");
    
    Logger.log("DASHBOARD DATA DIAGNOSIS REPORT:");
    
    // Test 1: Expenses Data
    Logger.log("Testing getExpensesData()...");
    let expensesData = null;
    try {
      expensesData = getExpensesData();
      Logger.log("- Expenses Total: " + expensesData.total);
      Logger.log("- Categories Count: " + expensesData.categories.length);
      if (expensesData.categories.length > 0) {
        Logger.log("- First Category: " + expensesData.categories[0].name + 
                  " = " + expensesData.categories[0].amount);
      }
    } catch (error) {
      Logger.log("ERROR IN getExpensesData(): " + error.toString());
      Logger.log("Stack trace: " + error.stack);
      return false;
    }
    
    // Test 2: Budget Summary
    Logger.log("Testing calculateBudgetSummary()...");
    let summary = null;
    try {
      summary = calculateBudgetSummary();
      Logger.log("- Monthly Total: " + summary.monthTotal);
      Logger.log("- Top Category: " + summary.topCategory);
      Logger.log("- Recent Transactions: " + summary.recentTransactions.length);
    } catch (error) {
      Logger.log("ERROR IN calculateBudgetSummary(): " + error.toString());
      Logger.log("Stack trace: " + error.stack);
      return false;
    }
    
    // Test 3: Loans Data
    Logger.log("Testing getLoansData()...");
    let loansData = null;
    try {
      loansData = getLoansData();
      Logger.log("- Outstanding Loans Total: " + loansData.totalOutstanding);
      Logger.log("- Active Loans Count: " + loansData.loans.length);
      if (loansData.loans.length > 0) {
        Logger.log("- First Loan: " + loansData.loans[0].borrower + 
                  " = " + loansData.loans[0].balance);
      }
    } catch (error) {
      Logger.log("ERROR IN getLoansData(): " + error.toString());
      Logger.log("Stack trace: " + error.stack);
      return false;
    }
    
    Logger.log("ALL DASHBOARD DATA TESTS PASSED!");
    return true;
  } catch (error) {
    Logger.log("FATAL ERROR IN DIAGNOSIS: " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    return false;
  }
}

/** diagnoseFormTriggers()
 * Checks if all required form triggers are properly set up
 * @return {Boolean} True if all required triggers exist, false if any are missing
 */
function diagnoseFormTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  const triggerMap = {};
  
  // Map trigger functions to their source IDs
  triggers.forEach(trigger => {
    const handlerFunction = trigger.getHandlerFunction();
    const triggerSource = trigger.getTriggerSourceId();
    
    if (!triggerMap[handlerFunction]) {
      triggerMap[handlerFunction] = [];
    }
    
    triggerMap[handlerFunction].push(triggerSource);
  });
  
  Logger.log("TRIGGER DIAGNOSTIC REPORT:");
  Logger.log(JSON.stringify(triggerMap, null, 2));
  
  // Check for required handlers
  const requiredHandlers = [
    "onExpenseFormSubmit", 
    "onExistingBorrowerLoanFormSubmit",
    "onNewBorrowerLoanFormSubmit", 
    "onLoanRepaymentFormSubmit"
  ];
  
  const missingHandlers = requiredHandlers.filter(handler => !triggerMap[handler]);
  
  if (missingHandlers.length > 0) {
    Logger.log("MISSING TRIGGERS FOR: " + missingHandlers.join(", "));
    Logger.log("Run initialize() to fix.");
    return false;
  }
  
  Logger.log("All required form triggers are properly set up.");
  return true;
}

/*****************************/
/*****************************/
/****   FBS FIXIT TOOLS   ****/
/*****************************/
/*****************************/
/**
 * Budget System FixIt Tools
 * 
 * A collection of functions to diagnose and fix common issues
 * in the Family Budget System
 */

/**
 * Fixes category mapping issues by ensuring all categories have valid IDs
 * and fixing any blank or invalid entries
 * @return {Object} Results of the fix operation
 */
function fixCategoryMappingIssues() {
  if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const categoriesSheet = SPREADSHEET.getSheetByName("Categories");
  
  if (!categoriesSheet) {
    Logger.log("ERROR: Categories sheet not found");
    return { success: false, message: "Categories sheet not found" };
  }
  
  // Analyze and fix categories
  const categoriesData = categoriesSheet.getDataRange().getValues();
  let fixedRows = 0;
  let nextAvailableId = 1;
  
  // Find highest existing ID to determine next available ID
  for (let i = 1; i < categoriesData.length; i++) {
    const id = categoriesData[i][0];
    if (typeof id === 'number' && !isNaN(id) && id >= nextAvailableId) {
      nextAvailableId = id + 1;
    }
  }
  
  Logger.log(`Next available category ID: ${nextAvailableId}`);
  
  // Process each row and fix issues
  for (let i = 1; i < categoriesData.length; i++) {
    const id = categoriesData[i][0];
    const name = categoriesData[i][1];
    
    // Skip rows with no name (likely blank rows)
    if (!name || name === "") continue;
    
    // Check if ID is missing or invalid
    if (id === "" || id === null || id === undefined || isNaN(id)) {
      // Assign a new ID
      Logger.log(`Fixing row ${i+1}: Assigning ID ${nextAvailableId} to "${name}"`);
      categoriesSheet.getRange(i+1, 1).setValue(nextAvailableId);
      nextAvailableId++;
      fixedRows++;
    }
  }
  
  return {
    success: true,
    message: `Fixed ${fixedRows} category mapping issues`,
    nextAvailableId: nextAvailableId
  };
}

/**
 * Tests the fix for date filtering issues in the getExpensesData function
 * This is a diagnostic version that doesn't modify the original function
 * @return {Object} Results showing what the output would be with fixed filtering
 */
function testFixedDateFiltering() {
  if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  if (!EXPENSES_SHEET) EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
  if (!CATEGORIES_SHEET) CATEGORIES_SHEET = SPREADSHEET.getSheetByName("Categories");
  
  // Get expenses data
  const expensesData = EXPENSES_SHEET.getDataRange().getValues();
  Logger.log(`Found ${expensesData.length - 1} expense records`);
  
  // Get current month and year (for regular function)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // TEST 1: Show data with the correct date format
  Logger.log("TEST 1: EXPENSE DATES ANALYSIS");
  
  for (let i = 1; i < Math.min(10, expensesData.length); i++) {
    try {
      const rawDate = expensesData[i][1]; // Date column
      let jsDate;
      
      if (rawDate instanceof Date) {
        jsDate = rawDate;
      } else {
        // Try to parse the date if it's not already a Date object
        jsDate = new Date(rawDate);
      }
      
      Logger.log(`Expense #${i}:`);
      Logger.log(` - Raw date value: ${rawDate} (${typeof rawDate})`);
      Logger.log(` - JavaScript Date: ${jsDate}`);
      Logger.log(` - Month: ${jsDate.getMonth()} (${currentMonth === jsDate.getMonth() ? "MATCH" : "NO MATCH"})`);
      Logger.log(` - Year: ${jsDate.getFullYear()} (${currentYear === jsDate.getFullYear() ? "MATCH" : "NO MATCH"})`);
    } catch (error) {
      Logger.log(`Error processing expense date at row ${i+1}: ${error}`);
    }
  }
  
  // TEST 2: Alternative date filtering approaches
  Logger.log("TEST 2: ALTERNATIVE DATE FILTERING");
  
  // Approach 1: Filter by month/year values
  let matchesApproach1 = 0;
  for (let i = 1; i < expensesData.length; i++) {
    try {
      const dateValue = expensesData[i][1];
      if (dateValue instanceof Date) {
        if (dateValue.getMonth() === currentMonth && dateValue.getFullYear() === currentYear) {
          matchesApproach1++;
        }
      }
    } catch (error) {
      // Skip errors
    }
  }
  
  // Approach 2: Use string comparison after formatting
  let matchesApproach2 = 0;
  const currentMonthStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM");
  
  for (let i = 1; i < expensesData.length; i++) {
    try {
      const dateValue = expensesData[i][1];
      if (dateValue instanceof Date) {
        const expenseMonthStr = Utilities.formatDate(dateValue, Session.getScriptTimeZone(), "yyyy-MM");
        if (expenseMonthStr === currentMonthStr) {
          matchesApproach2++;
        }
      }
    } catch (error) {
      // Skip errors
    }
  }
  
  // Approach 3: Test with a specific month/year
  const testMonth = 2; // March (0-indexed)
  const testYear = 2025;
  let matchesApproach3 = 0;
  
  for (let i = 1; i < expensesData.length; i++) {
    try {
      const dateValue = expensesData[i][1];
      if (dateValue instanceof Date) {
        if (dateValue.getMonth() === testMonth && dateValue.getFullYear() === testYear) {
          matchesApproach3++;
        }
      }
    } catch (error) {
      // Skip errors
    }
  }
  
  return {
    currentMonthMatches: matchesApproach1,
    formattedStringMatches: matchesApproach2,
    specificMonthMatches: matchesApproach3,
    testMonth: testMonth + 1, // Convert to 1-indexed for display
    testYear: testYear
  };
}

/**
 * Comprehensive diagnostic that checks sample expenses from
 * each month to help identify which months have data
 */
function analyzeExpenseMonths() {
  if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  if (!EXPENSES_SHEET) EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
  
  // Get expenses data
  const expensesData = EXPENSES_SHEET.getDataRange().getValues();
  Logger.log(`Found ${expensesData.length - 1} expense records`);
  
  // Track expenses by month/year
  const expensesByMonth = {};
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  
  // Process each expense
  for (let i = 1; i < expensesData.length; i++) {
    try {
      const dateValue = expensesData[i][1];
      if (dateValue instanceof Date) {
        const month = dateValue.getMonth();
        const year = dateValue.getFullYear();
        const amount = Number(expensesData[i][3]);
        
        const key = `${year}-${month}`;
        if (!expensesByMonth[key]) {
          expensesByMonth[key] = {
            year: year,
            month: month,
            monthName: monthNames[month],
            count: 0,
            total: 0,
            firstIndex: i,
          };
        }
        
        expensesByMonth[key].count++;
        if (!isNaN(amount)) {
          expensesByMonth[key].total += amount;
        }
      }
    } catch (error) {
      // Skip errors
    }
  }
  
  // Sort results by date
  const sortedMonths = Object.values(expensesByMonth).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  
  // Log results
  Logger.log("EXPENSE MONTH ANALYSIS");
  sortedMonths.forEach(monthData => {
    Logger.log(`${monthData.monthName} ${monthData.year}: ${monthData.count} expenses totaling ${monthData.total}`);
    
    // Show sample expense from this month
    const sampleIndex = monthData.firstIndex;
    try {
      const sampleDate = expensesData[sampleIndex][1];
      const sampleAmount = expensesData[sampleIndex][3];
      const sampleDescription = expensesData[sampleIndex][13]; // Assuming description is at column N (index 13)
      Logger.log(` - Sample: ${sampleDate.toISOString()} - ${sampleAmount} - ${sampleDescription}`);
    } catch (error) {
      Logger.log(` - Could not display sample: ${error}`);
    }
  });
  
  // Get current month for comparison
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  
  return {
    monthsWithData: sortedMonths.length,
    hasCurrentMonth: !!expensesByMonth[currentMonthKey],
    currentMonth: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
    monthsList: sortedMonths
  };
}

/**
 * Diagnoses issues with category mapping in the budget system
 * Detailed analysis of the Categories sheet and related lookups
 */
function diagnoseCategoryMapping() {
  // Initialize necessary sheets
  if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const categoriesSheet = SPREADSHEET.getSheetByName("Categories");
  
  if (!categoriesSheet) {
    Logger.log("ERROR: Categories sheet not found");
    return false;
  }
  
  // Analyze categories sheet structure
  const categoriesData = categoriesSheet.getDataRange().getValues();
  const headers = categoriesData[0];
  
  Logger.log("CATEGORY SHEET STRUCTURE");
  Logger.log(`Headers: ${headers.join(', ')}`);
  Logger.log(`Total rows: ${categoriesData.length}`);
  
  // Check for proper ID column format
  let idProblems = [];
  let nameProblems = [];
  let mappingIssues = [];
  
  // Create a mapping of IDs to names
  const categoryMap = {};
  
  for (let i = 1; i < categoriesData.length; i++) {
    const id = categoriesData[i][0];
    const name = categoriesData[i][1];
    const isActive = categoriesData[i][4]; // Assuming IsActive is at index 4
    
    // Check ID format
    if (id === "" || id === null || id === undefined) {
      idProblems.push(`Row ${i+1}: Empty ID`);
    } else if (typeof id !== 'number') {
      idProblems.push(`Row ${i+1}: ID "${id}" is type ${typeof id}, should be number`);
    }
    
    // Check name format
    if (name === "" || name === null || name === undefined) {
      nameProblems.push(`Row ${i+1}: Empty name for ID ${id}`);
    }
    
    // Check for duplicate IDs
    if (id !== "" && id !== null && id !== undefined) {
      if (categoryMap[id] && categoryMap[id] !== name) {
        mappingIssues.push(`Duplicate ID ${id} maps to both "${categoryMap[id]}" and "${name}"`);
      }
      categoryMap[id] = name;
    }
    
    // Log detailed category info
    Logger.log(`Category ${i+1}: ID=${id} (${typeof id}), Name="${name}", Active=${isActive}`);
  }
  
  // Report findings
  if (idProblems.length > 0) {
    Logger.log("ID PROBLEMS FOUND:");
    idProblems.forEach(problem => Logger.log(` - ${problem}`));
  } else {
    Logger.log("No ID problems found");
  }
  
  if (nameProblems.length > 0) {
    Logger.log("NAME PROBLEMS FOUND:");
    nameProblems.forEach(problem => Logger.log(` - ${problem}`));
  } else {
    Logger.log("No name problems found");
  }
  
  if (mappingIssues.length > 0) {
    Logger.log("MAPPING ISSUES FOUND:");
    mappingIssues.forEach(issue => Logger.log(` - ${issue}`));
  } else {
    Logger.log("No mapping issues found");
  }
  
  // Test how the lookup function works with this data
  Logger.log("TESTING LOOKUP FUNCTION");
  
  // Create a temporary version of lookupReferenceId
  function testLookup(lookupValue) {
    if (!lookupValue) return 1; // Default
    
    const data = categoriesData;
    const valueColumnIndex = 1; // Name column
    const idColumnIndex = 0; // ID column
    
    for (let i = 1; i < data.length; i++) {
      const rowValue = data[i][valueColumnIndex];
      if (rowValue === lookupValue) {
        Logger.log(`Found exact match for "${lookupValue}" with ID: ${data[i][idColumnIndex]}`);
        return data[i][idColumnIndex];
      }
    }
    
    Logger.log(`Value "${lookupValue}" not found. Using default ID: 1`);
    return 1;
  }
  
  // Test with some actual category names
  if (categoriesData.length > 1) {
    // Test first category
    const firstCategoryName = categoriesData[1][1];
    const firstLookupResult = testLookup(firstCategoryName);
    Logger.log(`Looking up "${firstCategoryName}" -> ID: ${firstLookupResult}`);
    
    // Test with a likely non-existent category
    const nonExistentLookupResult = testLookup("THIS CATEGORY DOES NOT EXIST");
    Logger.log(`Looking up "THIS CATEGORY DOES NOT EXIST" -> ID: ${nonExistentLookupResult}`);
  }
  
  return {
    idProblems,
    nameProblems,
    mappingIssues,
    categoryMap
  };
}