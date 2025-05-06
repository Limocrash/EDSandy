/** =============================
 * CORE_Bootstrap.gs   (src/core)
 *  ─ single location for ALL project triggers
 * =============================*/
function onOpen(e) { CORE_Menu.build(e); }
function onInstall(e) { onOpen(e); }     // needed if you ever publish

/*********
 * 
 * Additional triggers to add later
 * 
 ********
  function onEdit(e) {
    // optional: central onEdit router
  }
  
  function doGet(e) {
    return CORE_Dispatch.doGet(e);
  }
  
  function doPost(e) {
    return CORE_Dispatch.doPost(e);
  }
  */