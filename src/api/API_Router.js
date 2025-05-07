/**
 * API_Router.gs
 * — single entry‑point for all web‑app calls
 * ------------------------------------------------
 *  GET  ?action=getCategories          → AP_Categories.generateCategoryJSON()
 *  POST body.action=addExpense         → AP_Expenses.addExpense(data)
 */
function doGet(e) {
  const action = (e.parameter.action || '').toString();

  switch (action) {
    case 'getCategories':
      return ContentService
             .createTextOutput(AP_Categories.generateCategoryJSON())
             .setMimeType(ContentService.MimeType.JSON);

    default:
      // fallback – serve dashboard so hitting base URL still shows something
      return HtmlService.createHtmlOutputFromFile('DashboardPage');
  }
}

function doPost(e) {
  // expect JSON body: {action:"addExpense", ...payload }
  const body   = JSON.parse(e.postData.contents || '{}');
  const action = (body.action || '').toString();

  switch (action) {
    case 'addExpense':
      return ContentService.createTextOutput(
               JSON.stringify(AP_Expenses.addExpense(body))
             ).setMimeType(ContentService.MimeType.JSON);

    default:
      return ContentService.createTextOutput(
               JSON.stringify({ok:false,msg:'Unknown POST action'})
             ).setMimeType(ContentService.MimeType.JSON);
  }
}
