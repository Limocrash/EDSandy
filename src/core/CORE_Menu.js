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
  const TESTING  = [];

  function build() {
    const ui = SpreadsheetApp.getUi();

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
  //   – DevTools (default)
  //   – Testing (optional)
  //   – each module registers its items via  
  //     CORE_Menu.register(cb)          // DevTools
  //     CORE_Menu.registerTesting(cb)   // Testing
  //   – each callback receives the menu object
  //     as an argument, and can add items
  //     to it using the standard methods
  //     (addItem, addSubMenu, etc.)

  function register(cb)        { DEVTOOLS.push(cb); }
  function registerTesting(cb) { TESTING.push(cb); }

  return { build, register, registerTesting };

})();