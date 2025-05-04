### AP_CategoryAPI.js
``` - doGet ```

### DB_Diagnostics.js
 - showSystemStatus
 - findInconsistentReferences
 - diagnoseFormTriggers

### DB_FixItTools.js
 - fixCategoryMappingIssues
 - checkDatabaseIntegrity

### DB_Recurring.js
 - processRecurringTransactions
 - createRecurringTransactionsSheet
 - createExpenseFromRecurring
 - updateRecurringTransactionDates
 - calculateNextDueDate
 - setupRecurringTransactionsTrigger

### DV_BudgieConfig.js
 - DV_generateBudgieConfig
 - DV_showBudgieConfig

### DV_Categories.js
**** - onOpen
 - generateCategoryJSON

### DV_Globals.js
 - showGlobalsReloadTool
**** - onOpen

### DV_Initializer.js
**** - onOpen
 - initialize

### DV_Testing.js
 - validateGlobals
 - quickGlobalsCheck
 - addGlobalsMenu

### DV_ToolsMenu.js
 - showProcessingDialog
 - showTab
 - processRows
 - updateProgress
 - addLog
 - processFormResponses
 - getCallbackObject
 - updateProgressUI
 - reprocessRows
 - deleteAndRecreate
 - processFormResponseRow
 - showSystemStatus
 - findInconsistentReferences
 - runSystemAction
 - listFunctionNames
 - checkDatabaseIntegrity
 - diagnoseDashboardData
 - diagnoseFormTriggers
 - fixCategoryMappingIssues
 - testFixedDateFiltering
 - analyzeExpenseMonths
 - diagnoseCategoryMapping
 - testLookup

### FR_Configs.js

### FR_DevTools.js
**** - onOpen
 - runBatchExpenseReprocessing

### FR_Engine.js
 - buildRowData
 - appendRowToSheet

### FR_SubCategories.js
 - setupSubCategoriesSheet
 - getNextSubCategoryId
 - createSubCategory
 - getSubCategoriesByCategoryId
 - getSubCategoryNameById
 - getSubCategoryIdByName
 - updateExpenseFormWithSubcategories
 - createSubcategoryTrigger
 - updateSubcategoriesBasedOnCategory
 - updateAllFormsWithSubcategories
 - enhancedOnExpenseFormSubmit
 - setupSubcategorySystem

### FR_SubmissionRuntime.js
 - processFormSubmission
 - processFormResponseRow

### FR_Utils.js
 - parseFields
 - validateFields

### RP_Dashboard.js
 - updateDashboard

### RP_ExpensesFilter.js
 - setupDateRangeFilter
{{ - onEditFilterButton }}
**** - onOpen
 - createExpensesViewSheet
 - setupExpensesViewWithDateFiltering

### RP_WebApp.js
 ``` - doGet ```
 - createHomeView
 - createExpensesView
 - drawChart
 - formatDateRange
 - getExpensesData
 - calculateBudgetSummary
 - createLoansView
 - createCategoriesView
 - drawChart
 - getLoansData
 - getCategoryTrendsData
 ``` - doGet ```
 - createHomeView
 - createExpensesView
 - drawChart
 - formatDateRange
 - getExpensesData
 - calculateBudgetSummary

### RP_WebAppDebug.js
 - testWebAppDataFunctions
**** - onOpen
 - showWebAppUrl
 - createDataDiagnosticReport

### UT_Globals.js
 - getConfigValue
 - loadGlobals

### UT_ImportMainFRtoSandboxFR.js
 - importFr1toFr6

### UT_MergeFormResponsesFromTwoSs.js
 - importFr1toFr6

### UT_SheetSchema.js
 - generateCompleteSchema

### UT_SheetSchemaNew.js
 - myFunction

### UT_Utilities.js
 - processReceiptImage
 - createNewPerson
 - updateLoanStatus
 - getNextId
 - getPersonNameById
 - buildLoanDisplayText
 - updateFormDropdowns
 - updateExpenseFormDropdowns
 - updateExistingBorrowerLoanFormDropdowns
 - updateNewBorrowerLoanFormDropdowns
 - updateRepaymentFormDropdowns
 - setupDataValidation
 - setupCategoriesValidation
 - setupExpensesValidation

### UT_Validation.js
 - lookupReferenceId
 - getCategoryIdByName
 - getPaymentMethodIdByName
 - getPersonIdByName
 - getLoanTypeIdByName
 - getAccountIdFromPaymentMethod
 - validateLookupFields
 - validateDataType
 - logValidationErrors
 - refreshValidationErrors
 - autoFixValidationErrors

