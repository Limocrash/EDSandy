/** =============================
 * CORE_Menu.gs   (src/core)
 * One builder, two registries:
 *   – DevTools  (default)
 *   – Testing   (optional)
 * Each module registers its items via
 *   CORE_Menu.register(cb)          // DevTools
 *   CORE_Menu.registerTesting(cb)   // Testing
 *
 * =============================*/

// devTools menu items are registered in the
//   DEVTOOLS array, which is built in the  
//   build() function and added to the UI
// testing menu items are registered in the   
//   TESTING array, which is built in the
//   build() function and added to the UI

//   (if the array is not empty).
//   The menu is built in the onOpen() trigger  
//   (or onInstall() trigger).
var CORE_Menu = (function () {

  const DEVTOOLS = [];
  const TESTING  = [];

  function registerDev(label, funcName) { DEVTOOLS.push([label, funcName]); }
  function registerTest(label, funcName) { TESTING .push([label, funcName]); }

  /** Build menus — silently abort in headless context */
  function build(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;                    // IDE / head‑less → skip, no error

    const ui = SpreadsheetApp.getUi();
    if (DEVTOOLS.length) {
      const m = ui.createMenu('DevTools');
      DEVTOOLS.forEach(([lbl,fn]) => m.addItem(lbl, fn));
      m.addToUi();
    }
    if (TESTING.length) {
      const m = ui.createMenu('Testing');
      TESTING.forEach(([lbl,fn]) => m.addItem(lbl, fn));
      m.addToUi();
    }
  }

  return { registerDev, registerTest, build };
})();
