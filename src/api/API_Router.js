function doGet(e){
  const act = String(e.parameter.action || '');

  switch (act){
    case 'getCategories':
      return withCors_( ContentService
              .createTextOutput(generateCategoryJSON())
              .setMimeType(ContentService.MimeType.JSON) );

    // >>> remove the old fallback to DashboardPage
    default:
      return withCors_( ContentService
              .createTextOutput(
                JSON.stringify({error:true,msg:'Unknown action'})
              ).setMimeType(ContentService.MimeType.JSON) );
  }
}

function doPost(e){
  const body = JSON.parse(e.postData.contents || '{}');
  const act  = body.action || '';

  switch (act){
    case 'addExpense':
      const id = appendExpense_(body);        // helper below
      return withCors_( ContentService
              .createTextOutput(JSON.stringify({ok:true, expenseID:id}))
              .setMimeType(ContentService.MimeType.JSON) );

    default:
      return withCors_( ContentService
              .createTextOutput(
                JSON.stringify({error:true,msg:'Unknown action'})
              ).setMimeType(ContentService.MimeType.JSON) );
  }
}

// ---- helpers -------------------------------------------------
function appendExpense_(d){
  const sh = SpreadsheetApp.getActiveSpreadsheet()
             .getSheetByName('Form Responses 6 Backup');
  sh.appendRow([
    new Date(d.date),
    d.amount,
    d.category,
    d.subcategory,
    d.description,
    d.payMethod,
    (d.beneficiaries||[]).join(',')
  ]);
  return sh.getLastRow();
}

function withCors_(out){
  return out.setHeader('Access-Control-Allow-Origin','*')
            .setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS')
            .setHeader('Access-Control-Allow-Headers','Content-Type');
}
