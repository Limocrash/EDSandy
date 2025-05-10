// ---------- tiny helper ----------
function jsonOk(obj) {
  return HtmlService.createHtmlOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to add CORS headers
function addCorsHeaders(response) {
  return response
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('Access-Control-Allow-Origin', '*')
    .addMetaTag('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .addMetaTag('Access-Control-Allow-Headers', 'Content-Type');
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
  console.log(`Handling ${method} request`);

  let response;

  if (method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    response = HtmlService.createHtmlOutput('');
    return addCorsHeaders(response);
  }

  if (method === 'GET') {
    console.log('Handling GET request');
    const act = (e.parameter.action || '').toString();
    console.log(`Action: ${act}`);

    switch (act) {
      case 'getCategories':
        response = jsonOk(generateCategoryJSON());
        break;
      default:
        response = HtmlService.createHtmlOutputFromFile('DashboardPage');
    }

    return addCorsHeaders(response);
  }

  if (method === 'POST') {
    console.log('Handling POST request');
    try {
      const data = JSON.parse(e.postData.contents || '{}');
      console.log(`POST data: ${JSON.stringify(data)}`);

      switch (data.action) {
        case 'addExpense':
          const id = saveExpense(data); // Replace with your actual implementation
          response = jsonOk({ ok: true, expenseID: id });
          break;
        default:
          response = jsonOk({ ok: false, msg: 'Unknown action' });
      }
    } catch (err) {
      console.error(`Error in POST: ${err.message}`);
      response = jsonOk({ ok: false, msg: err.message || 'Server error' });
    }

    return addCorsHeaders(response);
  }

  // Default response for unsupported methods
  console.log('Unsupported HTTP method');
  response = jsonOk({ ok: false, msg: 'Unsupported HTTP method' });
  return addCorsHeaders(response);
}