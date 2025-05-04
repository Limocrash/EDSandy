/** FormCongigs.gs
 * Contains all FORM_CONFIGS configuration setups for forms
 * used by the Spreadsheet App
 */

/**
 * FORM_CONFIGS.REGULAR_EXPENSE
 * Defines structure and validation rules for Regular Expense form
 */
const FORM_CONFIGS = {
  REGULAR_EXPENSE: {
    sheetName: "Expenses",
    fields: {
      "Date": "TxnDate",
      "Amount": "amount",
      "Description": "description",
      "Category": "categoryName",
      "Subcategory": "subCategoryName",
      "Payment Method": "paymentMethodName",
      "Related To": "relatedToName",
      "Location": "location",
      "Notes": "notes",
      "Photo of Receipt": "receiptImage"
    },
    validation: {
      TxnDate: { type: "date", required: true },
      amount: { type: "number", required: true },
      description: { type: "string", required: true },
      categoryName: { type: "lookup", required: true, lookupFn: getCategoryIdByName },
      subCategoryName: { type: "string", required: true }, // "Other" is valid, used for post-review
      paymentMethodName: { type: "lookup", required: true, lookupFn: getPaymentMethodIdByName },
      relatedToName: { type: "lookup", required: false, lookupFn: getPersonIdByName },
      location: { type: "string", required: false },
      notes: { type: "string", required: false },
      receiptImage: { type: "string", required: false }
    }
  }
};
