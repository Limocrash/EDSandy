/********************************************************************/
/** =============================
 * DV_Categories.gs   (src/dev)
 *  ─ keeps category utilities; NO onOpen here
 * =============================*/

// ---- DevTools menu hook -----------------------------------------
(function(){
  CORE_Menu.register(menu => {
    menu.addItem('Generate Category JSON', 'generateCategoryJSON');
  });
})();

// ---- actual utility ---------------------------------------------
function generateCategoryJSON() {
  const ss   = SpreadsheetApp.getActive();
  const catS = ss.getSheetByName('Categories');
  const subS = ss.getSheetByName('SubCategories');

  if (!catS || !subS) {
    SpreadsheetApp.getUi().alert('❌ Categories sheets not found!');
    return '{}';
  }

  const catRows = catS.getDataRange().getValues().slice(1)
                     .filter(r => r[3] === true); // IsActive
  const subRows = subS.getDataRange().getValues().slice(1)
                     .filter(r => r[4] === true);

  const cats = {};
  catRows.forEach(([id,name]) => cats[id] = {name, subs:[]});
  subRows.forEach(([ ,pid, sub ])=>{ if(cats[pid]) cats[pid].subs.push(sub); });

  const out = {};
  Object.values(cats).forEach(o => out[o.name] = o.subs);
  const json = JSON.stringify(out, null, 2);

  // overwrite Drive copy
  const fname = 'categories.json';
  const files = DriveApp.getFilesByName(fname);
  if (files.hasNext()) files.next().setTrashed(true);
  DriveApp.createFile(fname, json, MimeType.PLAIN_TEXT);

  SpreadsheetApp.getActiveSpreadsheet().toast('JSON file created in Drive', 'Success', 5);
  Logger.log('JSON file created in Drive:\n' + json);
  return json;
}
