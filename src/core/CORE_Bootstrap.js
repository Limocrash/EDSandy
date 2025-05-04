/** =============================
 * CORE_Bootstrap.gs   (src/core)
 *  ─ single location for ALL project triggers
 * =============================*/

function onOpen() {
    CORE_Menu.build();         // assemble DevTools menu
  }
  
  function onEdit(e) {
    // optional: central onEdit router
  }
  
  function doGet(e) {
    return CORE_Dispatch.doGet(e);
  }
  
  function doPost(e) {
    return CORE_Dispatch.doPost(e);
  }