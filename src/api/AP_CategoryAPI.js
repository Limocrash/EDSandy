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
      var json = generateCategoryJSON();
      if (e.parameter.callback) {                       // JSON‑P branch
        return ContentService.createTextOutput(
             e.parameter.callback + '(' + json + ');')
           .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
    // -------- raw‑JSON branch (front‑end uses this) -------------
    return ContentService.createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
    // you can add more API routes later …
    // case 'addExpense': …

    default:
      // Fallback: 
      return ContentService.createTextOutput(
        '👋  “These aren’t the endpoints you’re looking for. Move along.” – Obi‑Wan')
        .setMimeType(ContentService.MimeType.TEXT);

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


  