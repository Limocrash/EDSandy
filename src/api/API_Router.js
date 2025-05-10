// ---------- tiny helper ----------
function jsonOk(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper to add CORS headers
function addCorsHeaders(response) {
  response.addHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  response.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.addHeader('Access-Control-Allow-Headers', 'Content-Type');
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
  console.log(`Handling ${method} request`);

  let response;

  if (method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    response = ContentService.createTextOutput('');
    return addCorsHeaders(response);
  }

  if (method === 'GET') {
    console.log('Handling GET request');
    const act = (e.parameter.action || '').toString();
    console.log(`Action: ${act}`);

    switch (act) {
      case 'getCategories':
        // Example: Proxying a request to an external URL
        const url = 'https://example.com/categories.json'; // Replace with your actual URL
        const fetchResponse = URLFetchApp.fetch(url, { method: 'get' });
        const jsonResponse = fetchResponse.getContentText();
        response = jsonOk(JSON.parse(jsonResponse));
        break;
      default:
        response = jsonOk({ ok: false, msg: 'Unknown action' });
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
          // Example: Proxying a POST request to an external URL
          const url = 'https://example.com/addExpense'; // Replace with your actual URL
          const fetchResponse = URLFetchApp.fetch(url, {
            method: 'post',
            payload: JSON.stringify(data),
            contentType: 'application/json',
          });
          const jsonResponse = fetchResponse.getContentText();
          response = jsonOk(JSON.parse(jsonResponse));
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