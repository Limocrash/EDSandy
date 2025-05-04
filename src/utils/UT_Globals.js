/**  UT_Globals.gs  (src/util)  **/
//  Utility function for loading global constants
//  from the Config! sheet in the active spreadsheet
var GLOBALS = {};   // consumed by other scripts

function loadGlobals() {
  const cfg = SpreadsheetApp.getActive().getSheetByName('Config');
  if (!cfg) throw new Error('Config sheet not found'); // Fail fast if missing
   
  // Assuming the first row is headers, and the data starts from row 2
  // Adjust the range as needed (e.g., if you have more columns)
  // Here we assume the first three columns are Key, Type, Value    
  // (Standard Config! format: Key | Type | Value | Notes)
  // We only need Key and Value for the GLOBALS object
  const data = cfg.getRange(2,1,cfg.getLastRow()-1,3).getValues(); // Key | Type | Value
  data.forEach(([key, , value]) => GLOBALS[key] = value);

  console.log('Globals loaded', GLOBALS);
  return GLOBALS;
}
