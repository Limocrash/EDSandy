function importFr1toFr6() {
    // 1) Load spreadsheet IDs from Config!
    const oldSsId = getConfigValue('SPREADSHEET_EXPENSE_DB_ID');
    const newSsId = getConfigValue('SPREADSHEET_ID');
    if (!oldSsId || !newSsId) {
      throw new Error('Missing SPREADSHEET_EXPENSE_DB_ID or SPREADSHEET_ID in Config!');
    }
  
    // 2) Open both spreadsheets and sheets
    const oldSs = SpreadsheetApp.openById(oldSsId);
    const newSs = SpreadsheetApp.openById(newSsId);
    const src = oldSs.getSheetByName('Form Responses 1');
    const dst = newSs.getSheetByName('Form Responses 6');
    if (!src || !dst) {
      throw new Error('Source or destination sheet not found');
    }
  
    // 3) Create a backup of the destination sheet
    const backupSheetName = 'Form Responses 6 Backup';
    let backupSheet = newSs.getSheetByName(backupSheetName);
    if (backupSheet) {
      newSs.deleteSheet(backupSheet); // Delete existing backup sheet if it exists
    }
    backupSheet = dst.copyTo(newSs);
    backupSheet.setName(backupSheetName);
    Logger.log(`Backup created: ${backupSheetName}`);
  
    // 4) Read all data
    const srcVals = src.getDataRange().getValues();
    const dstVals = backupSheet.getDataRange().getValues();
  
    // 5) Build set of existing keys to detect duplicates
    const existingKeys = new Set(
      dstVals.slice(1).map(r => [r[2], r[1], r[3]].join('|'))
    );
  
    // 6) Loop through source rows, map & append if new
    let imported = 0;
    for (let i = 1; i < srcVals.length; i++) {
      const r = srcVals[i];
      const compositeKey = [r[1], r[2], r[4]].join('|');
      if (existingKeys.has(compositeKey)) continue;
  
      const newRow = [
        r[0],   // A: Timestamp
        r[2],   // B: Date
        r[1],   // C: Amount
        r[4],   // D: Description
        r[3],   // E: Category
        r[9],   // F: Subcategory
        r[5],   // G: Payment Method
        r[6],   // H: Related To
        r[7],   // I: Location
        r[10],  // J: Notes
        r[8]    // K: Photo URL
      ];
      backupSheet.appendRow(newRow);
      imported++;
    }
  
    // 7) Report
    Logger.log(`importFr1toFr6: imported ${imported} new rows into the backup sheet.`);
  }