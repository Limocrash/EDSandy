// ---------- tiny helper ----------
function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to add CORS headers
function addCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// ---------- Main Entry Point ----------
function doGet(e) {
  return handleRequest('GET', e);
}

function doPost(e) {
  return handleRequest('POST', e);
}

function doOptions(e) {
  return handleRequest('OPTIONS', e);
}

// ---------- Request Router ----------
function handleRequest(method, e) {
  let response;

  if (method === 'OPTIONS') {
    // Handle CORS preflight
    response = ContentService.createTextOutput('');
    return addCorsHeaders(response);
  }

  if (method === 'GET') {
    const act = (e.parameter.action || '').toString();

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

  if (method === 'POST') {
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

  // Default response for unsupported methods
  response = jsonOk({ ok: false, msg: 'Unsupported HTTP method' });
  return addCorsHeaders(response);
}