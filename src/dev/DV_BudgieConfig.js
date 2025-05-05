// DV_BudgieConfig.js
// Script to generate a static Config.js file from the Config! sheet for Budgie site

function DV_generateBudgieConfig() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  if (!sheet) {
    Logger.log("Config sheet not found");
    return;
  }

  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);

  // Identify column indexes
  const keyCol = header.indexOf("Key");
  const typeCol = header.indexOf("Type");
  const valueCol = header.indexOf("Value");
  const urlCol = header.indexOf("DIRECT URL");

  if (keyCol === -1 || typeCol === -1 || valueCol === -1) {
    Logger.log("Missing required column headers in Config sheet");
    return;
  }

  const config = {};

  rows.forEach(row => {
    const key = row[keyCol];
    const type = row[typeCol];
    const value = row[valueCol];
    const directUrl = row[urlCol] || "";

    if (!key || !type) return; // Skip incomplete rows

    if (type === "FORM_ID") {
      if (directUrl && directUrl.startsWith("http")) {
        config[key] = directUrl;
      } else {
        config[key] = `https://docs.google.com/forms/d/e/${value}/viewform`;
      }
    } else if (type === "PUBLIC_URL" || type === "INTERNAL_URL" || type === "SHEET_ID" || type === "SPREADSHEET_ID" || type === "SCRIPT_ID") {
      config[key] = value;
    }
  });

  // Build JS output
  let js = "// Budgie Config - Auto-generated from Config! sheet\n";
  js += "window.BUDGIE_CONFIG = " + JSON.stringify(config, null, 2) + ";\n";

  Logger.log(js);
  return js;
}

function DV_showBudgieConfig() {
  const js = DV_generateBudgieConfig();
  if (js) {
    const html = HtmlService.createHtmlOutput(`<pre>${js.replace(/</g, "&lt;")}</pre>`)
      .setWidth(800)
      .setHeight(500);
    SpreadsheetApp.getUi().showModalDialog(html, "Generated Budgie Config.js");
  }
}
