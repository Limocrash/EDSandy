// API_Router.gs  — drop in once, forget it
function doGet(e)  { return route('GET',  e); }
function doPost(e) { return route('POST', e); }
function doOptions() { return json({ ok:true }); }

// --- central dispatcher ------------------------------------------------
function route(method, e) {
  const act = (e.parameter.action || '').toString();
  if (method === 'OPTIONS') return json({ ok:true });     // pre‑flight

  if (method === 'GET' && act === 'getCategories') {
    return json(generateCategoryJSON());
  }

  if (method === 'POST') {
    const body = JSON.parse(e.postData.contents || '{}');
    switch (body.action) {
      case 'addExpense':
        return json({ ok:true, id: saveExpense(body) });
    }
  }

  return json({ ok:false, msg:'Unknown request' });
}

// tiny helper
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}
