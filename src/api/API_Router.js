/**
 * API_Router.gs
 * Single entry point for web‑app requests (GET, POST, OPTIONS)
 */
function doGet(e) {
  const act = (e.parameter.action || '').toString();

  switch (act) {
    case 'getCategories':
      return jsonOk(generateCategoryJSON());
    default:
      // fallback — serve dashboard page
      return HtmlService.createHtmlOutputFromFile('DashboardPage');
  }
}

function doPost(e) {
  // handle real POST payloads
  try {
    const data = JSON.parse(e.postData.contents || '{}');

    switch (data.action) {
      case 'addExpense':
        const id = saveExpense(data);           // <-- your own util
        return jsonOk({ ok: true, expenseID: id });
      default:
        return jsonErr('Unknown action');
    }
  } catch (err) {
    return jsonErr(err.message || 'Server error');
  }
}

/**
 * Pre‑flight CORS ping: always return 200 + headers
 */
function doOptions() {
  return jsonOk({}, /*isOptions=*/true);
}

/* ---------- helpers ---------- */

function jsonOk(obj, isOptions) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin',   '*')
    .setHeader('Access-Control-Allow-Methods',  'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers',  'Content-Type')
    .setHeader('Access-Control-Max-Age',        '3600')      // cache pre‑flight
    .setHeader('Access-Control-Allow-Credentials', 'true')
    // OPTIONS requests must not include a body, so return early
    .setContent(isOptions ? '' : JSON.stringify(obj));
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok:false, msg }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}
