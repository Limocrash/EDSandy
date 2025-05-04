function generateCompleteSchema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const schemaSheetName = "📑 Schema Directory";

  let schemaSheet = ss.getSheetByName(schemaSheetName);
  let existingRelationships = {};

  if (!schemaSheet) schemaSheet = ss.insertSheet(schemaSheetName);
  else {
    const existingData = schemaSheet.getDataRange().getValues();
    existingData.slice(1).forEach(row => {
      const key = `${row[0]}|${row[3]}`;
      existingRelationships[key] = { status: row[6], role: row[7], relatedSheet: row[8] };
    });
    schemaSheet.clear();
  }

  schemaSheet.appendRow(["Sheet Name", "Sheet Type", "Column Number", "Header Name", "Column Type", "Format String", "Relationship Status", "Role", "Related Table/Sheet"]);

  let headerMap = {};

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName === schemaSheetName) return;

    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    if (lastCol === 0 || lastRow === 0) return;

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    headers.forEach(header => {
      if (header && header.toString().trim().toUpperCase().endsWith("ID")) {
        if (!headerMap[header]) headerMap[header] = [];
        headerMap[header].push(sheetName);
      }
    });
  });

  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    if (sheetName === schemaSheetName) return;

    const lastCol = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();

    if (lastCol === 0 || lastRow === 0) {
      schemaSheet.appendRow([
        `=HYPERLINK("#gid=${sheet.getSheetId()}", "${sheetName}")`,
        "Empty Sheet", "", "", "", "", "", "", ""
      ]);
      return;
    }

    const isDashboard = /DASHBOARD|SUMMARY|REPORT|BREAKDOWN|OVERVIEW/i.test(sheetName);

    if (isDashboard) {
      schemaSheet.appendRow([
        `=HYPERLINK("#gid=${sheet.getSheetId()}", "${sheetName}")`,
        "Dashboard (non-tabular)", "", "", "", "", "", "", ""
      ]);
      return;
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const secondRowFormats = lastRow > 1 ? sheet.getRange(2, 1, 1, lastCol).getNumberFormats()[0] : new Array(lastCol).fill("@");

    headers.forEach((header, index) => {
      const format = secondRowFormats[index];
      let columnType = "General";

      if (/y|m|d|h|s/i.test(format)) columnType = 'Date/Time';
      else if (format.includes('$') || format.includes('₱')) columnType = 'Currency';
      else if (format.includes('%')) columnType = 'Percentage';
      else if (format === "@") columnType = 'Text';
      else if (/0|#/.test(format)) columnType = 'Number';

      let relationshipStatus = "";
      let role = "";
      let relatedSheet = "";
      const key = `${sheetName}|${header}`;

      if (existingRelationships[key]) {
        relationshipStatus = existingRelationships[key].status;
        role = existingRelationships[key].role;
        relatedSheet = existingRelationships[key].relatedSheet;
      } else if (header && header.toString().trim().toUpperCase().endsWith("ID")) {
        const relatedSheets = headerMap[header] || [];
        if (relatedSheets.length > 1) {
          relationshipStatus = "Potential";
        }
      }

      schemaSheet.appendRow([
        `=HYPERLINK("#gid=${sheet.getSheetId()}", "${sheetName}")`,
        "Data Sheet", index + 1, header || "(No Header)", columnType, format, relationshipStatus, role, relatedSheet
      ]);
    });
  });

  const lastRowSchema = schemaSheet.getLastRow();
  const relationshipColumn = 7;

  const rules = schemaSheet.getConditionalFormatRules();
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Potential")
    .setBackground("#FFF2CC")
    .setRanges([schemaSheet.getRange(2, relationshipColumn, lastRowSchema)])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Confirmed")
    .setBackground("#C6EFCE")
    .setRanges([schemaSheet.getRange(2, relationshipColumn, lastRowSchema)])
    .build());

  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Reviewed - No Relation")
    .setBackground("#E7E6E6")
    .setRanges([schemaSheet.getRange(2, relationshipColumn, lastRowSchema)])
    .build());

  schemaSheet.setConditionalFormatRules(rules);

  schemaSheet.autoResizeColumns(1, 9);
}
