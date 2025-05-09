/**
 * API_Router.gs
 * Single entry point for web‑app requests (GET, POST, OPTIONS)
 */

// ---------- GET ----------
function doGet(e) {
  const act = (e.parameter.action || '').toString();

  switch (act) {
    case 'getCategories':
      return jsonOk(generateCategoryJSON());
    default:
      // Fallback – serve the dashboard HTML
      return HtmlService.createHtmlOutputFromFile('DashboardPage');
  }
}

// ---------- POST ----------
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');

    switch (data.action) {
      case 'addExpense':
        const id = saveExpense(data);            // <-- your own util
        return jsonOk({ ok: true, expenseID: id });
      default:
        return jsonOk({ ok: false, msg: 'Unknown action' });
    }
  } catch (err) {
    return jsonOk({ ok: false, msg: err.message || 'Server error' });
  }
}

// ---------- OPTIONS (CORS pre‑flight) ----------
function doOptions() {
  // Empty 200 OK is enough for modern browsers
  return jsonOk({ ok: true });
}

// ---------- tiny helper ----------
function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
