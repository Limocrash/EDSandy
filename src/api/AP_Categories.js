/**
 * AP_Categories.gs
 * Helpers for category / sub‑category endpoints
 */
var AP_Categories = (function () {

    /** reads Categories + SubCategories sheets → {Cat:[Subs]} JSON string */
    function generateCategoryJSON () {
      const ss        = SpreadsheetApp.getActive();
      const catRows   = ss.getSheetByName('Categories')
                          .getDataRange().getValues().slice(1)           // skip header
                          .filter(r => r[4] === true);                   // isActive
      const subRows   = ss.getSheetByName('SubCategories')
                          .getDataRange().getValues().slice(1)
                          .filter(r => r[4] === true);
  
      const cats = {};
      catRows.forEach(([id, name])         => cats[id] = {name, subs:[]});
      subRows.forEach(([_, pid , sub])     => cats[pid] && cats[pid].subs.push(sub));
  
      const out = {};
      Object.values(cats).forEach(o => out[o.name] = o.subs);
      return JSON.stringify(out, null, 2);
    }
  
    // expose
    return { generateCategoryJSON };
  
  })();
  