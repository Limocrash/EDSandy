/**
 * RecurringTransactions.gs
 * 
 * This script handles all recurring transaction functionality for the budget tracking system.
 */

/**
 * Process recurring transactions
 * Checks for due recurring transactions and creates actual expense entries
 */
function processRecurringTransactions() {
  try {
    // Initialize if needed
    if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    if (!EXPENSES_SHEET) EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
    
    const today = new Date();
    
    // Check if RecurringTransactions sheet exists
    let RECURRING_TRANSACTIONS_SHEET = SPREADSHEET.getSheetByName("RecurringTransactions");
    if (!RECURRING_TRANSACTIONS_SHEET) {
      // Create sheet if it doesn't exist
      RECURRING_TRANSACTIONS_SHEET = createRecurringTransactionsSheet();
      Logger.log("Created new RecurringTransactions sheet");
      return;
    }
    
    const recurringData = RECURRING_TRANSACTIONS_SHEET.getDataRange().getValues();
    
    // Skip header row
    Logger.log(`Found ${recurringData.length - 1} recurring transactions to check`);
    let processedCount = 0;
    
    for (let i = 1; i < recurringData.length; i++) {
      const row = recurringData[i];
      
      // Expected column mappings (based on createRecurringTransactionsSheet structure):
      // 0: RecurringID, 1: Description, 2: Amount, 3: CategoryID, 4: PaymentMethodID, 
      // 5: PersonID, 6: RelatedPersonID, 7: Frequency, 8: StartDate, 9: EndDate, 
      // 10: LastProcessedDate, 11: NextDueDate, 12: IsActive, 13: Notes
      
      const isActive = row[12]; // IsActive column
      if (!isActive) {
        Logger.log(`Skipping inactive recurring transaction: ${row[1]}`);
        continue;
      }
      
      const nextDueDate = new Date(row[11]); // NextDueDate column
      
      // Check if transaction is due today or earlier
      if (nextDueDate <= today) {
        Logger.log(`Processing recurring transaction "${row[1]}" due on ${nextDueDate.toDateString()}`);
        
        // Create actual expense entry from recurring template
        const wasCreated = createExpenseFromRecurring(row);
        
        if (wasCreated) {
          // Update last processed date and next due date
          updateRecurringTransactionDates(i + 1, row);
          processedCount++;
        }
      }
    }
    
    Logger.log(`Processed ${processedCount} recurring transactions`);
    
    // Update dashboard if any transactions were processed
    if (processedCount > 0) {
      updateDashboard();
    }
    
    return processedCount;
  } catch (error) {
    Logger.log("Error processing recurring transactions: " + error.toString());
    return 0;
  }
}

/**
 * Creates the RecurringTransactions sheet with the appropriate structure
 * @return {Sheet} The newly created sheet
 */
function createRecurringTransactionsSheet() {
  // Create the sheet
  const sheet = SPREADSHEET.insertSheet("RecurringTransactions");
  
  // Add headers
  sheet.appendRow([
    "RecurringID",       // A
    "Description",       // B
    "Amount",            // C
    "CategoryID",        // D
    "PaymentMethodID",   // E
    "PersonID",          // F
    "RelatedPersonID",   // G
    "Frequency",         // H
    "StartDate",         // I
    "EndDate",           // J
    "LastProcessedDate", // K
    "NextDueDate",       // L
    "IsActive",          // M
    "Notes"              // N
  ]);
  
  // Format headers
  sheet.getRange("A1:N1").setFontWeight("bold").setBackground("#e0e0e0");
  
  // Set data validation for various columns
  
  // Frequency validation
  const frequencyValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Daily", "Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Yearly"], true)
    .setAllowInvalid(false)
    .setHelpText("Please select a valid frequency")
    .build();
  sheet.getRange("H2:H1000").setDataValidation(frequencyValidation);
  
  // IsActive validation (checkbox)
  const activeValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(["TRUE", "FALSE"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange("M2:M1000").setDataValidation(activeValidation);
  
  // Date formatting
  sheet.getRange("I2:L1000").setNumberFormat("yyyy-mm-dd");
  
  // Amount formatting
  sheet.getRange("C2:C1000").setNumberFormat("#,##0.00");
  
  // Add sample entry
  sheet.appendRow([
    1,                                     // RecurringID
    "Sample Recurring Expense",            // Description
    500,                                   // Amount
    1,                                     // CategoryID (update with actual category)
    1,                                     // PaymentMethodID (update with actual payment method)
    2,                                     // PersonID (assuming 2 is Amor)
    "",                                    // RelatedPersonID
    "Monthly",                             // Frequency
    new Date(),                            // StartDate
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)),  // EndDate (1 year from now)
    "",                                    // LastProcessedDate
    new Date(),                            // NextDueDate
    true,                                  // IsActive
    "Sample recurring expense - update or delete this row"  // Notes
  ]);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 14);
  
  // Set default values for IsActive column
  sheet.getRange("M2").setValue(true);
  
  return sheet;
}

/**
 * Creates an expense entry from a recurring transaction template
 * @param {Array} recurringRow - Row data from RecurringTransactions sheet
 * @return {Boolean} Success flag
 */
function createExpenseFromRecurring(recurringRow) {
  try {
    // Map recurring transaction fields to expense fields
    const description = recurringRow[1];   // Description
    const amount = recurringRow[2];        // Amount
    const categoryId = recurringRow[3];    // CategoryID
    const paymentMethodId = recurringRow[4]; // PaymentMethodID
    const personId = recurringRow[5];      // PersonID
    const relatedPersonId = recurringRow[6]; // RelatedPersonID
    const notes = recurringRow[13];        // Notes
    
    // Get account ID from payment method
    let accountId = getAccountIdFromPaymentMethod(paymentMethodId);
    if (!accountId) accountId = 1;
    
    // Generate new expense ID
    const newExpenseId = getNextId(EXPENSES_SHEET);
    
    // Current date/time for timestamps
    const now = new Date();
    
    // Add expense to the sheet
    Logger.log(`Creating expense from recurring template: ${description}`);
    EXPENSES_SHEET.appendRow([
      newExpenseId,                // 1. ExpenseID
      now,                         // 2. Date (today)
      now,                         // 3. Time
      amount,                      // 4. Amount
      "PHP",                       // 5. Currency
      "Regular Expense",           // 6. TransactionType
      "",                          // 7. RelatedLoanID
      categoryId,                  // 8. CategoryID
      "",                          // 9. SubCategoryID
      paymentMethodId,             // 10. PaymentMethodID
      accountId,                   // 11. AccountID
      personId,                    // 12. PersonID
      relatedPersonId,             // 13. RelatedToPersonID
      description,                 // 14. Description
      "",                          // 15. ReceiptImageURL (no receipt for recurring)
      "",                          // 16. Location
      "Pending",                   // 17. Status
      "Recurring",                 // 18. EntryMethod
      "RecurringID: " + recurringRow[0], // 19. FormSubmissionID (use RecurringID)
      now,                         // 20. DateCreated
      now                          // 21. LastUpdated
    ]);
    
    Logger.log(`Successfully created expense from recurring template: ${description}`);
    return true;
  } catch (error) {
    Logger.log("Error creating expense from recurring transaction: " + error.toString());
    return false;
  }
}

/**
 * Updates the LastProcessedDate and NextDueDate fields for a recurring transaction
 * @param {Number} rowNumber - Row number in the RecurringTransactions sheet
 * @param {Array} recurringRow - Row data from RecurringTransactions sheet
 */
function updateRecurringTransactionDates(rowNumber, recurringRow) {
  try {
    // Get the RecurringTransactions sheet
    const sheet = SPREADSHEET.getSheetByName("RecurringTransactions");
    
    // Update LastProcessedDate to today
    const today = new Date();
    sheet.getRange(rowNumber, 11).setValue(today); // Column K
    
    // Calculate next due date based on frequency
    const frequency = recurringRow[7];  // Frequency column
    const nextDueDate = calculateNextDueDate(today, frequency);
    
    // Check if next due date is after end date
    const endDate = recurringRow[9] ? new Date(recurringRow[9]) : null;
    if (endDate && nextDueDate > endDate) {
      // If so, set IsActive to false
      sheet.getRange(rowNumber, 13).setValue(false); // Column M (IsActive)
      Logger.log(`Recurring transaction reached end date. Deactivated: ${recurringRow[1]}`);
    } else {
      // Otherwise, update next due date
      sheet.getRange(rowNumber, 12).setValue(nextDueDate); // Column L
      Logger.log(`Updated next due date to ${nextDueDate.toDateString()} for: ${recurringRow[1]}`);
    }
  } catch (error) {
    Logger.log("Error updating recurring transaction dates: " + error.toString());
  }
}

/**
 * Calculates the next due date based on frequency
 * @param {Date} currentDate - Current date
 * @param {String} frequency - Frequency string (Daily, Weekly, etc.)
 * @return {Date} Next due date
 */
function calculateNextDueDate(currentDate, frequency) {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case "Daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "Weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "Bi-Weekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "Monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "Quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "Yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly if unknown frequency
      nextDate.setMonth(nextDate.getMonth() + 1);
  }
  
  return nextDate;
}

/**
 * Sets up a time-based trigger to automatically process recurring transactions
 */
function setupRecurringTransactionsTrigger() {
  // Remove any existing triggers for this function
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processRecurringTransactions') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a new daily trigger - runs at approximately 1am
  ScriptApp.newTrigger('processRecurringTransactions')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();
  
  Logger.log("Set up daily trigger for recurring transactions processing");
}