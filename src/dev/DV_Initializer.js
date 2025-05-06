/************************************************************
 *  DV_Initializer.gs (src/dev)                             *
 ************************************************************
 * Uses the CORE_Menu module to register items
 * for the DevTools and Testing menus.
 * This module is responsible for initializing
 * the spreadsheet and setting up form triggers.
 * It also includes a function to reload global constants
 * from the Config sheet and log them. 
 ***********************************************************/

/***************
 *  DevTools Menu Registration
 *
 *  This section registers items for the DevTools menu.
 *  Each item is associated with a function that will be
 *  executed when the item is clicked.
 ***************/

(function(){
  /* DevTools items */
  CORE_Menu.registerdev('Initialize System',          'initialize');
  CORE_Menu.registerdev('View System Status',         'showSystemStatus');
  CORE_Menu.registerdev('Process Form Responses',     'showProcessingDialog');
  CORE_Menu.registerdev('Update Form Dropdowns',      'updateFormDropdowns');
  CORE_Menu.registerdev('Reload Globals from Config', 'showGlobalsReloadTool');
  CORE_Menu.registerdev('Quick Globals Check',        'quickGlobalsCheck');
  });

  /* Testing items */
  (function(){
    CORE_Menu.registerdev('Run All Tests',                'testBudgetSystemImprovements');
    CORE_Menu.registerdev('Test Dashboard',               'updateDashboard');
    CORE_Menu.registerdev('Test Recurring Transactions',  'processRecurringTransactions');
    CORE_Menu.registerdev('Test Receipt Image Fix',       'testReceiptImageFix');
    CORE_Menu.registerdev('Test Globals & Validation',    'quickGlobalsCheck');
  })();


// Global variables for sheet access
let SPREADSHEET,
    EXPENSES_SHEET,
    CATEGORIES_SHEET,
    PAYMENT_METHODS_SHEET,
    PEOPLE_SHEET,
    ACCOUNTS_SHEET,
    LOANS_SHEET,
    LOAN_TRANSACTIONS_SHEET,
    LOAN_TYPE_SHEET,
    RELATIONSHIPS_SHEET;

/***************
 * Form IDs
 *
 *  ThaddItemese are the CURRENT IDs of the Google Forms used in the
 *  system as of 25-05-04. The hard declaratations below
 *  are used to set up triggers for form submissions until
 *  a dynamic solution is implemented. 
 ***************/

// TODO: Replace hard‑coded IDs with Config lookup

const EXPENSE_FORM_ID               = '1k4b_ohCmhSuNQtHtNA2FG6X7WUkiaAD6wnihTEQj5lo';
const EXISTING_BORROWER_LOAN_ID     = '1QHOmpAP6UHbKzaTG7iQ8Ga1QDitHq-D2lBUV6GuRpPU';
const NEW_BORROWER_LOAN_ID          = '17CtX427le-VSJ7pGpTL00Krn91M_r6ENUjN_gRZOw-8';
const REPAYMENT_FORM_ID             = '10g0BwW6E4UmoLsBPuX36WYwGB5CJWFJvWRhWNGfafG0';

/***************
 *  Initialization Function
 *
 *  This function initializes the spreadsheet and sets up
 *  the necessary triggers for form submissions. It also
 *  clears any existing triggers to avoid duplicates.
 ***************/

function initialize() {
  SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();

  EXPENSES_SHEET          = SPREADSHEET.getSheetByName('Expenses');
  CATEGORIES_SHEET        = SPREADSHEET.getSheetByName('Categories');
  PAYMENT_METHODS_SHEET   = SPREADSHEET.getSheetByName('PaymentMethods');
  PEOPLE_SHEET            = SPREADSHEET.getSheetByName('People');
  ACCOUNTS_SHEET          = SPREADSHEET.getSheetByName('Accounts');
  LOANS_SHEET             = SPREADSHEET.getSheetByName('Loans');
  LOAN_TRANSACTIONS_SHEET = SPREADSHEET.getSheetByName('LoanTransactions');
  LOAN_TYPE_SHEET         = SPREADSHEET.getSheetByName('LoanTypes');
  RELATIONSHIPS_SHEET     = SPREADSHEET.getSheetByName('Relationships');

  Logger.log('Initialized sheet references');

  // Clear & reset triggers
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('onExpenseFormSubmit')
    .forForm(FormApp.openById(EXPENSE_FORM_ID)).onFormSubmit().create();
  ScriptApp.newTrigger('onExistingBorrowerLoanFormSubmit')
    .forForm(FormApp.openById(EXISTING_BORROWER_LOAN_ID)).onFormSubmit().create();
  ScriptApp.newTrigger('onNewBorrowerLoanFormSubmit')
    .forForm(FormApp.openById(NEW_BORROWER_LOAN_ID)).onFormSubmit().create();
  ScriptApp.newTrigger('onLoanRepaymentFormSubmit')
    .forForm(FormApp.openById(REPAYMENT_FORM_ID)).onFormSubmit().create();

  Logger.log('Form triggers initialized');
}