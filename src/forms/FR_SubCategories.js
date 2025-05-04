/**
 * SubCategoriesImplementation.gs
 * 
 * This script implements subcategory support for the expense form
 * and enhances the form processing to handle subcategories correctly.
 */

/**
 * Creates or updates the SubCategories sheet
 * @return {Sheet} The SubCategories sheet
 */
function setupSubCategoriesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let subCategoriesSheet = ss.getSheetByName("SubCategories");
  
  if (!subCategoriesSheet) {
    // Create the sheet
    subCategoriesSheet = ss.insertSheet("SubCategories");
    
    // Set up the headers
    subCategoriesSheet.appendRow([
      "SubCategoryID",
      "SubCategoryName",
      "CategoryID",
      "Description",
      "IsActive",
      "DateCreated"
    ]);
    
    // Format headers
    subCategoriesSheet.getRange("A1:F1").setBackground("#f1f1f1").setFontWeight("bold");
    
    // Add some default subcategories
    const categoriesSheet = ss.getSheetByName("Categories");
    const categoriesData = categoriesSheet.getDataRange().getValues();
    
    // Find grocery category ID
    let groceryCategoryId = null;
    for (let i = 1; i < categoriesData.length; i++) {
      if (categoriesData[i][1] === "Groceries") {
        groceryCategoryId = categoriesData[i][0];
        break;
      }
    }
    
    // Add some example subcategories if we found the Groceries category
    if (groceryCategoryId) {
      subCategoriesSheet.appendRow([
        1, "Produce", groceryCategoryId, "Fruits and vegetables", true, new Date()
      ]);
      subCategoriesSheet.appendRow([
        2, "Meat", groceryCategoryId, "Meat and poultry", true, new Date()
      ]);
      subCategoriesSheet.appendRow([
        3, "Dairy", groceryCategoryId, "Milk, cheese, and other dairy products", true, new Date()
      ]);
      subCategoriesSheet.appendRow([
        4, "Bakery", groceryCategoryId, "Bread and baked goods", true, new Date()
      ]);
    }
    
    // Set column widths
    subCategoriesSheet.setColumnWidth(1, 120); // SubCategoryID
    subCategoriesSheet.setColumnWidth(2, 200); // SubCategoryName
    subCategoriesSheet.setColumnWidth(3, 120); // CategoryID
    subCategoriesSheet.setColumnWidth(4, 250); // Description
    subCategoriesSheet.setColumnWidth(5, 80);  // IsActive
    subCategoriesSheet.setColumnWidth(6, 150); // DateCreated
  }
  
  return subCategoriesSheet;
}

/**
 * Gets the next available SubCategory ID
 * @return {Number} Next available ID
 */
function getNextSubCategoryId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subCategoriesSheet = ss.getSheetByName("SubCategories");
  
  if (!subCategoriesSheet) {
    return 1;
  }
  
  const data = subCategoriesSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return 1; // Only header row
  }
  
  // Find the max ID
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
 * Creates a new subcategory
 * @param {String} name - Name of the subcategory
 * @param {Number} categoryId - Parent category ID
 * @param {String} description - Description of the subcategory
 * @return {Number} New subcategory ID
 */
function createSubCategory(name, categoryId, description = "") {
  // Make sure the subcategories sheet exists
  const subCategoriesSheet = setupSubCategoriesSheet();
  
  // Get the next ID
  const newId = getNextSubCategoryId();
  
  // Add the new subcategory
  subCategoriesSheet.appendRow([
    newId,
    name,
    categoryId,
    description,
    true, // IsActive
    new Date() // DateCreated
  ]);
  
  return newId;
}

/**
 * Gets subcategories for a specific category
 * @param {Number} categoryId - Category ID to get subcategories for
 * @return {Array} Array of subcategory objects
 */
function getSubCategoriesByCategoryId(categoryId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subCategoriesSheet = ss.getSheetByName("SubCategories");
  
  if (!subCategoriesSheet) {
    return [];
  }
  
  const data = subCategoriesSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return []; // Only header row
  }
  
  // Filter subcategories by category ID
  const subcategories = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === categoryId && data[i][4] === true) {
      subcategories.push({
        id: data[i][0],
        name: data[i][1],
        categoryId: data[i][2],
        description: data[i][3]
      });
    }
  }
  
  return subcategories;
}

/**
 * Gets subcategory name by ID
 * @param {Number} subCategoryId - Subcategory ID
 * @return {String} Subcategory name or empty string if not found
 */
function getSubCategoryNameById(subCategoryId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subCategoriesSheet = ss.getSheetByName("SubCategories");
  
  if (!subCategoriesSheet) {
    return "";
  }
  
  const data = subCategoriesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === subCategoryId) {
      return data[i][1];
    }
  }
  
  return "";
}

/**
 * Gets subcategory ID by name
 * @param {String} name - Subcategory name
 * @param {Number} categoryId - Parent category ID (optional)
 * @return {Number} Subcategory ID or null if not found
 */
function getSubCategoryIdByName(name, categoryId = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subCategoriesSheet = ss.getSheetByName("SubCategories");
  
  if (!subCategoriesSheet || !name) {
    return null;
  }
  
  const data = subCategoriesSheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    // If categoryId is specified, match by name and categoryId
    if (categoryId !== null) {
      if (data[i][1] === name && data[i][2] === categoryId && data[i][4] === true) {
        return data[i][0];
      }
    } else {
      // Otherwise just match by name
      if (data[i][1] === name && data[i][4] === true) {
        return data[i][0];
      }
    }
  }
  
  return null;
}

/**
 * Updates the expense form to include subcategory support
 * @param {String} formId - ID of the expense form to update
 */
function updateExpenseFormWithSubcategories(formId) {
  // Get the form
  const form = FormApp.openById(formId);
  
  // Check if form exists
  if (!form) {
    Logger.log("Form not found with ID: " + formId);
    return;
  }
  
  // Get the current form items
  const items = form.getItems();
  
  // Find the category item
  let categoryItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === "Category") {
      categoryItem = items[i];
      break;
    }
  }
  
  // Check if category item exists
  if (!categoryItem) {
    Logger.log("Category question not found in form");
    return;
  }
  
  // Find or create the subcategory item
  let subcategoryItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === "Subcategory") {
      subcategoryItem = items[i];
      break;
    }
  }
  
  // If subcategory doesn't exist, create it after the category question
  if (!subcategoryItem) {
    // Find the index of the category item
    let categoryIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].getId() === categoryItem.getId()) {
        categoryIndex = i;
        break;
      }
    }
    
    // Create a new subcategory list item
    subcategoryItem = form.addListItem();
    subcategoryItem.setTitle("Subcategory")
      .setHelpText("Select a subcategory (optional)")
      .setRequired(false);
    
    // Move it to just after the category question
    if (categoryIndex !== -1 && categoryIndex < items.length - 1) {
      form.moveItem(subcategoryItem, categoryIndex + 1);
    }
  }
  
  // Add "Notes" field if it doesn't exist
  let notesItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === "Notes") {
      notesItem = items[i];
      break;
    }
  }
  
  if (!notesItem) {
    // Find the description field
    let descriptionIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].getTitle() === "Description") {
        descriptionIndex = i;
        break;
      }
    }
    
    // Add notes field after description
    notesItem = form.addParagraphTextItem();
    notesItem.setTitle("Notes")
      .setHelpText("Additional notes about this expense (optional)")
      .setRequired(false);
    
    // Move it to just after the description question
    if (descriptionIndex !== -1 && descriptionIndex < items.length - 1) {
      form.moveItem(notesItem, descriptionIndex + 1);
    }
  }
  
  Logger.log("Form updated with subcategory and notes fields");
}

/**
 * Creates the form trigger for dynamic subcategory selection
 * @param {String} formId - ID of the form to add the trigger to
 */
function createSubcategoryTrigger(formId) {
  // Delete any existing triggers for this form
  const triggers = ScriptApp.getUserTriggers(FormApp.openById(formId));
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'updateSubcategoriesBasedOnCategory') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Create a new trigger
  ScriptApp.newTrigger('updateSubcategoriesBasedOnCategory')
    .forForm(formId)
    .onFormSubmit()
    .create();
  
  Logger.log("Subcategory trigger created for form: " + formId);
}

/**
 * Updates the subcategory list based on selected category
 * @param {Object} e - Form submit event object
 */
function updateSubcategoriesBasedOnCategory(e) {
  try {
    // Get the form
    const form = e.source;
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Find the category response
    let selectedCategory = null;
    let categoryItemId = null;
    
    for (let i = 0; i < itemResponses.length; i++) {
      const itemResponse = itemResponses[i];
      const item = itemResponse.getItem();
      
      if (item.getTitle() === "Category") {
        selectedCategory = itemResponse.getResponse();
        categoryItemId = item.getId();
        break;
      }
    }
    
    // If no category selected, skip
    if (!selectedCategory) {
      Logger.log("No category selected");
      return;
    }
    
    // Get the category ID for the selected category
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const categoriesSheet = ss.getSheetByName("Categories");
    const categoriesData = categoriesSheet.getDataRange().getValues();
    
    let categoryId = null;
    for (let i = 1; i < categoriesData.length; i++) {
      if (categoriesData[i][1] === selectedCategory) {
        categoryId = categoriesData[i][0];
        break;
      }
    }
    
    // If category not found, skip
    if (categoryId === null) {
      Logger.log("Category ID not found for: " + selectedCategory);
      return;
    }
    
    // Get subcategories for this category
    const subcategories = getSubCategoriesByCategoryId(categoryId);
    
    // Find the subcategory question in the form
    const formItems = form.getItems();
    let subcategoryItem = null;
    
    for (let i = 0; i < formItems.length; i++) {
      if (formItems[i].getTitle() === "Subcategory") {
        subcategoryItem = formItems[i].asListItem();
        break;
      }
    }
    
    // If subcategory question not found, skip
    if (!subcategoryItem) {
      Logger.log("Subcategory question not found in form");
      return;
    }
    
    // Update subcategory choices
    const subcategoryNames = subcategories.map(sub => sub.name);
    if (subcategoryNames.length > 0) {
      subcategoryItem.setChoiceValues(subcategoryNames);
    } else {
      // If no subcategories, add a placeholder
      subcategoryItem.setChoiceValues(["None"]);
    }
    
    Logger.log("Updated subcategories based on selected category: " + selectedCategory);
  } catch (error) {
    Logger.log("Error in updateSubcategoriesBasedOnCategory: " + error.toString());
  }
}

/**
 * Updates all forms with subcategory support
 */
function updateAllFormsWithSubcategories() {
  updateExpenseFormWithSubcategories(EXPENSE_FORM_ID);
  createSubcategoryTrigger(EXPENSE_FORM_ID);
  
  Logger.log("All forms updated with subcategory support");
  return "Forms have been updated with subcategory and notes fields.";
}

/**
 * Modify onExpenseFormSubmit to handle subcategories
 * This is an enhanced version of the original function
 */
function enhancedOnExpenseFormSubmit(e) {
  try {
    // Initialize sheet references
    if (!SPREADSHEET) SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    if (!EXPENSES_SHEET) EXPENSES_SHEET = SPREADSHEET.getSheetByName("Expenses");
    if (!CATEGORIES_SHEET) CATEGORIES_SHEET = SPREADSHEET.getSheetByName("Categories");
    if (!PAYMENT_METHODS_SHEET) PAYMENT_METHODS_SHEET = SPREADSHEET.getSheetByName("PaymentMethods");
    if (!PEOPLE_SHEET) PEOPLE_SHEET = SPREADSHEET.getSheetByName("People");
    if (!ACCOUNTS_SHEET) ACCOUNTS_SHEET = SPREADSHEET.getSheetByName("Accounts");
    
    Logger.log("Processing expense form submission...");
    
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Extract form data
    let expenseData = {
      date: new Date(),
      amount: 0,
      description: "",
      notes: "",
      categoryName: "",
      subcategoryName: "",
      paymentMethodName: "",
      relatedToName: "",
      location: "",
      receiptImage: null,
      formSubmissionId: formResponse.getId(),
      validationErrors: []
    };
    
    // Process each form field
    for (let i = 0; i < itemResponses.length; i++) {
      const item = itemResponses[i];
      const question = item.getItem().getTitle();
      const answer = item.getResponse();
      
      switch(question) {
        case "Date":
          if (answer) {
            expenseData.date = new Date(answer);
          } else {
            expenseData.validationErrors.push("Date is required");
          }
          break;
        case "Amount":
          if (answer && !isNaN(parseFloat(answer))) {
            expenseData.amount = parseFloat(answer);
          } else {
            expenseData.validationErrors.push("Amount must be a valid number");
          }
          break;
        case "Description":
          if (answer && answer.trim().length > 0) {
            expenseData.description = answer.trim();
          } else {
            expenseData.validationErrors.push("Description is required");
          }
          break;
        case "Notes":
          expenseData.notes = answer || "";
          break;
        case "Category":
          expenseData.categoryName = answer;
          break;
        case "Subcategory":
          expenseData.subcategoryName = answer;
          break;
        case "Payment Method":
          expenseData.paymentMethodName = answer;
          break;
        case "Related To":
          expenseData.relatedToName = answer;
          break;
        case "Location":
          expenseData.location = answer;
          break;
        case "Photo of Receipt":
          if (answer) {
            expenseData.receiptImage = answer;
          }
          break;
      }
    }
    
    // Validate lookup fields
    const validationErrors = validateLookupFields(expenseData, [
      {
        field: "category",
        value: expenseData.categoryName,
        lookupFunction: getCategoryIdByName,
        required: true,
        errorMessage: `Category "${expenseData.categoryName}" not found`
      },
      {
        field: "paymentMethod",
        value: expenseData.paymentMethodName,
        lookupFunction: getPaymentMethodIdByName,
        required: true,
        errorMessage: `Payment method "${expenseData.paymentMethodName}" not found`
      },
      {
        field: "relatedTo",
        value: expenseData.relatedToName,
        lookupFunction: getPersonIdByName,
        required: false
      }
    ]);
    
    // Add any new validation errors
    expenseData.validationErrors = expenseData.validationErrors.concat(validationErrors);
    
    // If there are validation errors, log them and exit
    if (expenseData.validationErrors.length > 0) {
      logValidationErrors(expenseData);
      Logger.log("Validation errors found: " + expenseData.validationErrors.join(", "));
      return false;
    }
    
    // Get person ID for Amor
    let personId = getPersonIdByName("Amor");
    if (!personId) {
      personId = 2; // Default to Amor's ID if lookup fails
    }
    
    // Process receipt image if present
    let receiptUrl = "";
    if (expenseData.receiptImage) {
      receiptUrl = processReceiptImage(expenseData.receiptImage, expenseData.date, expenseData.description);
    }
    
    // Get account ID from payment method
    let accountId = getAccountIdFromPaymentMethod(expenseData.paymentMethodId);
    
    // Handle subcategory
    let subCategoryId = null;
    if (expenseData.subcategoryName && expenseData.subcategoryName !== "None") {
      // Try to find the subcategory ID
      subCategoryId = getSubCategoryIdByName(expenseData.subcategoryName, expenseData.categoryId);
      
      // If not found, create a new subcategory
      if (subCategoryId === null) {
        subCategoryId = createSubCategory(
          expenseData.subcategoryName,
          expenseData.categoryId,
          "Created from expense form"
        );
      }
    }
    
    // Generate new expense ID
    const newExpenseId = getNextId(EXPENSES_SHEET);
    
    // Current date/time for timestamps
    const now = new Date();
    
    // Add expense to the sheet - with subcategory support
    Logger.log("Adding expense to sheet...");
    EXPENSES_SHEET.appendRow([
      newExpenseId,                        // 1. ExpenseID
      expenseData.date,                    // 2. Date
      now,                                 // 3. Time
      expenseData.amount,                  // 4. Amount
      "PHP",                               // 5. Currency
      "Regular Expense",                   // 6. TransactionType
      "",                                  // 7. RelatedLoanID
      expenseData.categoryId,              // 8. CategoryID
      subCategoryId || "",                 // 9. SubCategoryID
      expenseData.paymentMethodId,         // 10. PaymentMethodID
      accountId,                           // 11. AccountID
      personId,                            // 12. PersonID
      expenseData.relatedToId || "",       // 13. RelatedToPersonID
      expenseData.description,             // 14. Description
      receiptUrl,                          // 15. ReceiptImageURL
      expenseData.location,                // 16. Location
      "Pending",                           // 17. Status
      "Form",                              // 18. EntryMethod
      expenseData.formSubmissionId,        // 19. FormSubmissionID
      now,                                 // 20. DateCreated
      now,                                 // 21. LastUpdated
      expenseData.notes || ""              // 22. Notes (new field)
    ]);
    
    // Update dashboard
    updateDashboard();
    
    Logger.log("Successfully processed expense: " + expenseData.description);
    return true;
  } catch (error) {
    Logger.log("Error processing expense form submission: " + error.toString());
    Logger.log("Stack trace: " + error.stack);
    return false;
  }
}

/**
 * Main function to set up subcategory system
 */
function setupSubcategorySystem() {
  // Create or update subcategories sheet
  setupSubCategoriesSheet();
  
  // Update the expense form with subcategory support
  updateAllFormsWithSubcategories();
  
  // Return success message
  return "Subcategory system has been set up. You'll need to assign your onExpenseFormSubmit function to use the enhanced version.";
}