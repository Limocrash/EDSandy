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

// ─── Future AP_AddExpense.gs (inside AP_CategoryAPI for now) ───
function doPost(e) {
  try {
    // `mode:'no-cors'` forces text/plain, so accept either JSON or form‑data
    const data = e.postData.type === 'application/json'
                 ? JSON.parse(e.postData.contents)
                 : JSON.parse(e.parameter.payload || '{}');

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
                  .getSheetByName('Form Responses 6 Backup');

    sheet.appendRow([
      new Date(data.date),
      Number(data.amount),
      data.category,
      data.subcategory,
      data.description,
      data.payMethod,
      (data.beneficiaries || []).join(',')
    ]);

    // fire‑and‑forget response (browser can’t read it in no‑cors mode)
    return ContentService
           .createTextOutput('OK')
           .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // still return 200 so browser doesn’t complain
    Logger.log(err);
    return ContentService.createTextOutput('ERR');
  }
}

// ──────────────────────────────────────────────────────────────

/** OLD addExpense() function before May 5, 2025
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
*/

  