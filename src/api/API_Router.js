/**
 * API_Router.gs – ultra‑simple, no‑CORS, “just work” router
 * - GET  …/exec?action=getCategories   → JSON‑P
 * - POST …/exec   (body.action = 'addExpense') → writes & returns 200
 *
 * version 2323.073.22 stardate: 20250511.1006
*/

/* ---------- GET ---------- */
function doGet(e) {
  const act = (e.parameter.action || '').toString();

  if (act === 'getCategories') {
    // serve JSON‑P so <script src=...> can load it cross‑origin
    const jsonp = `loadCategoryMap(${generateCategoryJSON()});`;
    return ContentService.createTextOutput(jsonp)
                         .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return HtmlService.createHtmlOutput('Budgie backend alive ✓');
}

/* ---------- POST ---------- */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');

    if (data.action === 'addExpense') {
      // AP_Expenses.addExpense returns row number – ignore on client for now
      AP_Expenses.addExpense(data);
    }
  } catch (err) {
    // swallow – client can’t read body anyway while we’re in no‑cors mode
  }

  // always return 200 so the browser sees “OK”
  return ContentService.createTextOutput('{ "ok": true }')
                       .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- helpers ---------- */
function generateCategoryJSON() {
  // whatever you already had that returns:
  // { "Housing":[ "Rent","Electric" ], "Food":[ "Groceries", … ] }
  return DV_Categories.getCategoryMapJSON();   // for example
}
