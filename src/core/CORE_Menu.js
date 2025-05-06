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
var CORE_Menu = (function () {
  const DEVTOOLS = [];
  const TESTING = [];

  function build() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return; // Skip if IDE / headless

    const ui = ss.getUi(); // Safe now

    // ----- DevTools menu -----
    const devMenu = ui.createMenu('DevTools');
    DEVTOOLS.forEach(cb => cb(devMenu));
    devMenu.addToUi();

    // ----- Testing menu (only if items) -----
    if (TESTING.length) {
      const testMenu = ui.createMenu('Testing');
      TESTING.forEach(cb => cb(testMenu));
      testMenu.addToUi();
    }
  }

  // ----- Registering menu items -----
  function register(cb) {
    DEVTOOLS.push(cb);
  }
  function registerTesting(cb) {
    TESTING.push(cb);
  }

  return { build, register, registerTesting };
})();