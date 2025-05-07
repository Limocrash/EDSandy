/** 
 * AP_CategoryAPI.gs
 * Entry point for Web‑app requests 
 **/

function doGet(e) {
  const action = (e.parameter.action || '').toString();
  
  switch (action) {   // Switch for API routes
    /**  
     * endpoint 1: generateCategoryJSON()   
     * GET .../exec?action=getCategories
     * Returns live { "Category":[ "Sub", … ] } JSON
     */
    case 'getCategories':
      return ContentService
              .createTextOutput(generateCategoryJSON())     // reuse generator
              .setMimeType(ContentService.MimeType.JSON);

    // you can add more API routes later …
    // case 'addExpense': …

    default:
      // Fallback: serve the dashboard HTML
      return HtmlService.createHtmlOutputFromFile('DashboardPage');
  }
}

function doPost(e){
  const data = JSON.parse(e.postData.contents);

  // convert ["P001","P003"] → "P001,P003" for now
  const benCSV = (data.beneficiaries || []).join(',');

  // append to Form Responses 6 backup sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
                .getSheetByName('Form Responses 6 Backup');
  sheet.appendRow([
    new Date(data.date),
    data.amount,
    data.category,
    data.subcategory,
    data.description,
    data.payMethod,
    benCSV
  ]);

  return ContentService.createTextOutput(
            JSON.stringify({ok:true, expenseID: sheet.getLastRow()}))
          .setMimeType(ContentService.MimeType.JSON);
}


  