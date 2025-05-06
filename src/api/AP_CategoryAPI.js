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

  