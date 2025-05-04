/**
 * importFr1toFr6.gs
 *
 * Copies historical responses from "Form Responses 1" in the old Expenses Database
 * spreadsheet into "Form Responses 6" of the current EDSandy spreadsheet.  
 * It remaps columns to match the new form layout and skips any rows
 * that already exist (based on a composite key of Timestamp, Amount, Date, Description).
 *
 * Column mapping (source -> destination):
 *   A: Timestamp      -> A
 *   C: Date           -> B
 *   B: Amount         -> C
 *   E: Description    -> D
 *   D: Category       -> E
 *   J: Subcategory    -> F
 *   F: Payment Method -> G
 *   G: Related To     -> H
 *   H: Location       -> I
 *   K: Notes          -> J
 *   I: Photo URL      -> K
 */
function importFr1toFr6() {
  // 1) Load spreadsheet IDs from Config!
  // Get the old and new spreadsheet IDs from config
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

  // 3) Read all data
  // Get all values from both sheets
  // Note: getDataRange().getValues() returns a 2D array of all values in the range
  //       including headers, so we can skip the first row (index 0) for processing 
  //       and use it to build the set of existing keys.
  //       This is more efficient than reading each row individually.
  //       The first row is assumed to be the header row.
  //       The second row (index 1) is the first data row.
  //       The last row (index -1) is the last data row.
  const srcVals = src.getDataRange().getValues();
  const dstVals = dst.getDataRange().getValues();

  // 4) Build set of existing keys to detect duplicates
  // Create a set of composite keys from the destination sheet
  // The composite key is a combination of Timestamp, Amount, Date, Description
  const existingKeys = new Set(
    dstVals.slice(1).map(r => [r[2], r[1], r[3]].join('|'))
  );

  // 5) Loop through source rows, map & append if new
  // Skip the first row (header) and check if the composite key already exists in the destination sheet
  // If it does not exist, create a new row with the mapped values and append it to the destination sheet
  // Note: We use slice(1) to skip the header row in srcVals
  let imported = 0;
  for (let i = 1; i < srcVals.length; i++) {
    const r = srcVals[i];
    const compositeKey = [r[1], r[2], r[4]].join('|');
    if (existingKeys.has(compositeKey)) continue;

    // remap columns into newRow for FR6
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
    dst.appendRow(newRow);
    imported++;
  }

  // 6) Report
  Logger.log(`importFr1toFr6: imported ${imported} new rows.`);
}
