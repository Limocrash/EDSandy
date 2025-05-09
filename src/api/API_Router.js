// ---------- tiny helper ----------
function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to add CORS headers
function addCorsHeaders(response) {
  const headers = response.getHeaders();
  headers['Access-Control-Allow-Origin'] = '*'; // Allow all origins
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type';
  return response;
}

// ---------- GET ----------
function doGet(e) {
  const act = (e.parameter.action || '').toString();

  let response;
  switch (act) {
    case 'getCategories':
      response = jsonOk(generateCategoryJSON());
      break;
    default:
      // Fallback – serve the dashboard HTML
      response = HtmlService.createHtmlOutputFromFile('DashboardPage');
  }

  return addCorsHeaders(response);
}

// ---------- POST ----------
function doPost(e) {
  let response;
  try {
    const data = JSON.parse(e.postData.contents || '{}');

    switch (data.action) {
      case 'addExpense':
        const id = saveExpense(data); // <-- your own util
        response = jsonOk({ ok: true, expenseID: id });
        break;
      default:
        response = jsonOk({ ok: false, msg: 'Unknown action' });
    }
  } catch (err) {
    response = jsonOk({ ok: false, msg: err.message || 'Server error' });
  }

  return addCorsHeaders(response);
}

// ---------- OPTIONS (CORS pre-flight) ----------
function doOptions() {
  // Empty 200 OK is enough for modern browsers
  const response = jsonOk({ ok: true });
  return addCorsHeaders(response);
}