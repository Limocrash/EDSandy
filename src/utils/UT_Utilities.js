/**
 * Utilities.gs
 * 
 * This script contains utility functions used throughout the budget tracking system.
 */

/**
 * Processes receipt image from form submission
 * @param {String} fileId - ID of uploaded file
 * @param {Date} expenseDate - Date of the expense
 * @param {String} description - Description of the expense
 * @return {String} URL to the processed image in Google Drive
 */
function processReceiptImage(fileId, expenseDate, description) {
  try {
    // Get the file from form responses
    const formFile = DriveApp.getFileById(fileId);
    
    // Get or create the budget root folder
    let budgetFolder;
    const budgetFolderName = "006 Budget";
    const budgetFolderIterator = DriveApp.getRootFolder().getFoldersByName(budgetFolderName);
    
    if (budgetFolderIterator.hasNext()) {
      budgetFolder = budgetFolderIterator.next();
    } else {
      budgetFolder = DriveApp.getRootFolder().createFolder(budgetFolderName);
    }
    
    // Get or create year folder
    const year = Utilities.formatDate(expenseDate, Session.getScriptTimeZone(), "yyyy");
    let yearFolder;
    const yearFolderIterator = budgetFolder.getFoldersByName(year);
    
    if (yearFolderIterator.hasNext()) {
      yearFolder = yearFolderIterator.next();
    } else {
      yearFolder = budgetFolder.createFolder(year);
    }
    
    // Get or create month folder - FIXED: now using yearFolder as parent instead of budgetFolder
    const yearMonth = Utilities.formatDate(expenseDate, Session.getScriptTimeZone(), "yy-MM");
    let monthFolder;
    const monthFolderIterator = yearFolder.getFoldersByName(yearMonth);
    
    if (monthFolderIterator.hasNext()) {
      monthFolder = monthFolderIterator.next();
    } else {
      monthFolder = yearFolder.createFolder(yearMonth);
    }
    
    // Format date for filename
    const dateString = Utilities.formatDate(expenseDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    
    // Create a sanitized filename
    let sanitizedDescription = description.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    const newFileName = dateString + "_" + sanitizedDescription + "_receipt" + 
                        "." + formFile.getName().split('.').pop();
    
    // Copy the file to our organized folder structure
    const newFile = formFile.makeCopy(newFileName, monthFolder);
    
    // Get the URL to the file
    const url = newFile.getUrl();
    
    // Remove the original file to save space
    formFile.setTrashed(true);
    
    return url;
  } catch (error) {
    Logger.log("Error processing receipt image: " + error.toString());
    return "";
  }
}

/**
 * Creates a new person record
 * @param {String} fullName - Person's full name
 * @param {String} relationship - Relationship to family
 * @param {String} contact - Contact information
 * @param {String} notes - Additional notes
 * @return {Number} New person ID
 */
function createNewPerson(fullName, relationship, contact, notes) {
  try {
    const newPersonId = getNextId(PEOPLE_SHEET);
    
    PEOPLE_SHEET.appendRow([
      newPersonId,          // PersonID
      fullName,             // FullName
      relationship,         // Relationship
      true,                 // IsActive
      contact || "",        // Contact
      notes || "",          // Notes
      new Date(),           // DateCreated
      new Date()            // LastUpdated
    ]);
    
    return newPersonId;
  } catch (error) {
    Logger.log("Error creating new person: " + error.toString());
    return 1; // Default person ID as fallback
  }
}

/**
 * Updates a loan's status
 * @param {Number} loanId - Loan ID to update
 * @param {String} status - New status value
 */
function updateLoanStatus(loanId, status) {
  try {
    const loanData = LOANS_SHEET.getDataRange().getValues();
    for (let i = 1; i < loanData.length; i++) {
      if (loanData[i][0] === loanId) {
        LOANS_SHEET.getRange(i + 1, 10).setValue(status); // Status is in column J (index 9 + 1)
        LOANS_SHEET.getRange(i + 1, 15).setValue(new Date()); // LastUpdated column
        break;
      }
    }
  } catch (error) {
    Logger.log("Error updating loan status: " + error.toString());
  }
}

/**
 * Gets the next available ID for a sheet
 * @param {Sheet} sheet - Sheet to get next ID for
 * @return {Number} Next available ID
 */
function getNextId(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return 1; // First row is headers
  }
  
  // Find the maximum ID value
  let maxId = 0;
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    if (id && id > maxId) {
      maxId = id;
    }
  }
  
  return maxId + 1;
}

/**
 * Gets person name by ID
 * @param {Number} id - Person ID
 * @return {String} Person name or empty string if not found
 */
function getPersonNameById(id) {
  const data = PEOPLE_SHEET.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      return data[i][1]; // Return name
    }
  }
  
  return "";
}

/**
 * Builds a display text for a loan based on its data
 * Matches the format used in the form dropdown
 * @param {Array} loanRow - Row data from the Loans sheet
 * @return {String} Display text for the loan
 */
function buildLoanDisplayText(loanRow) {
  // Get borrower name from ID
  const borrowerId = loanRow[4]; // BorrowerID
  const borrowerName = getPersonNameById(borrowerId);
  
  // Get purpose and amount
  const purpose = loanRow[8]; // Purpose
  const amount = loanRow[6]; // Amount
  
  return `${borrowerName}: ${purpose} (${amount})`;
}

/**
 * Updates dropdown options in all forms
 */
function updateFormDropdowns() {
  // Get spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Update each form using the FORM_ID constants
  updateExpenseFormDropdowns(ss, EXPENSE_FORM_ID);
  updateNewBorrowerLoanFormDropdowns(ss, NEW_BORROWER_LOAN_FORM_ID);
  updateExistingBorrowerLoanFormDropdowns(ss, EXISTING_BORROWER_LOAN_FORM_ID);
  updateRepaymentFormDropdowns(ss, REPAYMENT_FORM_ID);
  
  Logger.log('All form dropdowns updated successfully');
}

/**
 * Updates dropdowns for the Expense Form
 */
function updateExpenseFormDropdowns(ss, formId) {
  const form = FormApp.openById(formId);
  
  // Get categories
  const categoriesSheet = ss.getSheetByName('Categories');
  const categoriesData = categoriesSheet.getRange(2, 2, categoriesSheet.getLastRow()-1, 1).getValues();
  const categories = categoriesData.map(row => row[0]).filter(String);
  
  // Get payment methods
  const methodsSheet = ss.getSheetByName('PaymentMethods');
  const methodsData = methodsSheet.getRange(2, 2, methodsSheet.getLastRow()-1, 1).getValues();
  const paymentMethods = methodsData.map(row => row[0]).filter(String);
  
  // Get people
  const peopleSheet = ss.getSheetByName('People');
  const peopleData = peopleSheet.getRange(2, 2, peopleSheet.getLastRow()-1, 1).getValues();
  const people = peopleData.map(row => row[0]).filter(String);
  
  // Update form questions
  const items = form.getItems();
  items.forEach(item => {
    const title = item.getTitle();
    
    if (title === 'Category') {
      item.asListItem().setChoiceValues(categories);
    }
    else if (title === 'Payment Method') {
      item.asMultipleChoiceItem().setChoiceValues(paymentMethods);
    }
    else if (title === 'Related To') {
      item.asMultipleChoiceItem().setChoiceValues(people);
    }
  });
  
  Logger.log('Expense form dropdowns updated successfully');
}

/**
 * Updates dropdowns for the Existing Borrower Loan Form
 */
function updateExistingBorrowerLoanFormDropdowns(ss, formId) {
  const form = FormApp.openById(formId);
  
  // Get payment methods
  const methodsSheet = ss.getSheetByName('PaymentMethods');
  const methodsData = methodsSheet.getRange(2, 2, methodsSheet.getLastRow()-1, 1).getValues();
  const paymentMethods = methodsData.map(row => row[0]).filter(String);
  
  // Get people
  const peopleSheet = ss.getSheetByName('People');
  const peopleData = peopleSheet.getRange(2, 2, peopleSheet.getLastRow()-1, 1).getValues();
  const people = peopleData.map(row => row[0]).filter(String);
  
  // Get loan types
  const loanTypeSheet = ss.getSheetByName('LoanTypes');
  const loanTypeData = loanTypeSheet.getRange(2, 2, loanTypeSheet.getLastRow()-1, 1).getValues();
  const loanTypes = loanTypeData.map(row => row[0]).filter(String);
  
  // Update form questions
  const items = form.getItems();
  items.forEach(item => {
    const title = item.getTitle();
    
    if (title === 'Who is the Lender?') {
      item.asMultipleChoiceItem().setChoiceValues(people);
    }
    else if (title === 'Who is the Borrower?') {
      item.asListItem().setChoiceValues(people);
    }
    else if (title === 'Loan Type') {
      item.asListItem().setChoiceValues(loanTypes);
    }
    else if (title === 'Source of Funds') {
      item.asListItem().setChoiceValues(paymentMethods);
    }
  });
  
  Logger.log('Existing borrower loan form dropdowns updated successfully');
}

/**
 * Updates dropdowns for the New Borrower Loan Form
 */
function updateNewBorrowerLoanFormDropdowns(ss, formId) {
  const form = FormApp.openById(formId);
  
  // Get payment methods
  const methodsSheet = ss.getSheetByName('PaymentMethods');
  const methodsData = methodsSheet.getRange(2, 2, methodsSheet.getLastRow()-1, 1).getValues();
  const paymentMethods = methodsData.map(row => row[0]).filter(String);
  
  // Get people (for lenders)
  const peopleSheet = ss.getSheetByName('People');
  const peopleData = peopleSheet.getRange(2, 2, peopleSheet.getLastRow()-1, 1).getValues();
  const people = peopleData.map(row => row[0]).filter(String);
  
  // Get loan types
  const loanTypeSheet = ss.getSheetByName('LoanTypes');
  const loanTypeData = loanTypeSheet.getRange(2, 2, loanTypeSheet.getLastRow()-1, 1).getValues();
  const loanTypes = loanTypeData.map(row => row[0]).filter(String);
  
  // Get relationships
  const relationshipsSheet = ss.getSheetByName('Relationships');
  const relationshipsData = relationshipsSheet.getRange(2, 2, relationshipsSheet.getLastRow()-1, 1).getValues();
  const relationships = relationshipsData.map(row => row[0]).filter(String);
  relationships.push("Other");
  
  // Update form questions
  const items = form.getItems();
  items.forEach(item => {
    const title = item.getTitle();
    
    if (title === 'Who is the Lender?') {
      item.asMultipleChoiceItem().setChoiceValues(people);
    }
    else if (title === 'Loan Type') {
      item.asListItem().setChoiceValues(loanTypes);
    }
    else if (title === 'Relationship') {
      item.asListItem().setChoiceValues(relationships);
    }
    else if (title === 'Source of Funds') {
      item.asListItem().setChoiceValues(paymentMethods);
    }
  });
  
  Logger.log('New borrower loan form dropdowns updated successfully');
}

/**
 * Updates dropdowns for the Loan Repayment Form
 */
function updateRepaymentFormDropdowns(ss, formId) {
  const form = FormApp.openById(formId);
  
  // Get payment methods
  const methodsSheet = ss.getSheetByName('PaymentMethods');
  const methodsData = methodsSheet.getRange(2, 2, methodsSheet.getLastRow()-1, 1).getValues();
  const paymentMethods = methodsData.map(row => row[0]).filter(String);
  
  // Get active loans 
  const loansSheet = ss.getSheetByName('Loans');
  const loansData = loansSheet.getDataRange().getValues();
  
  // Skip header row and filter for active loans
  const activeLoans = [];
  for (let i = 1; i < loansData.length; i++) {
    if (loansData[i][9] === 'Active') { // Status column (J)
      const loanId = loansData[i][0]; // LoanID
      const borrowerId = loansData[i][4]; // BorrowerID
      const borrowerName = getPersonNameById(borrowerId);
      const purpose = loansData[i][8]; // Purpose column
      const amount = loansData[i][6]; // Amount column
      
      const displayText = `${borrowerName}: ${purpose} (${amount})`;
      activeLoans.push(displayText);
    }
  }
  activeLoans.push("This loan isn't in the system yet");
  
  // Update form questions
  const items = form.getItems();
  items.forEach(item => {
    const title = item.getTitle();
    
    if (title === 'Which loan is this for?') {
      item.asMultipleChoiceItem().setChoiceValues(activeLoans);
    }
    else if (title === 'Which loan is being repaid?') {
      item.asListItem().setChoiceValues(activeLoans);
    }
    else if (title === 'Payment Method Received') {
      item.asListItem().setChoiceValues(paymentMethods);
    }
  });
  
  Logger.log('Loan repayment form dropdowns updated successfully');
}

/**
 * Sets up data validation rules across all sheets
 */
function setupDataValidation() {
  // Set up Categories validation
  setupCategoriesValidation();
  
  // Set up Expenses validation
  setupExpensesValidation();
}

/**
 * Sets up validation rules for Categories sheet
 */
function setupCategoriesValidation() {
  const categoriesSheet = SPREADSHEET.getSheetByName("Categories");
  const lastRow = Math.max(categoriesSheet.getLastRow(), 2);
  
  // Ensure CategoryName is not empty
  const nameValidation = SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=LEN(TRIM(B2:B))>0')
    .setHelpText('Category name cannot be empty')
    .build();
  categoriesSheet.getRange('B2:B' + lastRow).setDataValidation(nameValidation);
  
  // Ensure ParentCategoryID exists in CategoryID column if not empty
  const parentValidation = SpreadsheetApp.newDataValidation()
    .requireValueInRange(categoriesSheet.getRange('A2:A' + lastRow), true)
    .setAllowInvalid(false)
    .setHelpText('Parent category must exist')
    .build();
  categoriesSheet.getRange('C2:C' + lastRow).setDataValidation(parentValidation);
}

/**
 * Sets up validation rules for Expenses sheet
 */
function setupExpensesValidation() {
  const expensesSheet = SPREADSHEET.getSheetByName("Expenses");
  const lastRow = Math.max(expensesSheet.getLastRow(), 2);
  
  // Create dropdown for Status
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Reviewed', 'Reconciled'], true)
    .setAllowInvalid(false)
    .setHelpText('Please select a valid status')
    .build();
  expensesSheet.getRange('Q2:Q' + lastRow).setDataValidation(statusValidation);
  
  // Set validation for CategoryID
  const categorySheet = SPREADSHEET.getSheetByName("Categories");
  const categoryLastRow = Math.max(categorySheet.getLastRow(), 2);
  const categoryValidation = SpreadsheetApp.newDataValidation()
    .requireValueInRange(categorySheet.getRange('A2:A' + categoryLastRow), true)
    .setAllowInvalid(false)
    .setHelpText('Please select a valid category')
    .build();
  expensesSheet.getRange('H2:H' + lastRow).setDataValidation(categoryValidation);
}
