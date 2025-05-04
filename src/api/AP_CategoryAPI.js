/** AP_CategoryAPI.gs
 *  Public endpoint:  GET .../exec?action=getCategories
 *  Returns live { "Category":[ "Sub", … ] } JSON
 */
function doGet(e) {
    if (e && e.parameter.action === 'getCategories') {
      const json = generateCategoryJSON();           // re‑use DevTools function
      return ContentService
          .createTextOutput(json)
          .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput('OK');
  }
  