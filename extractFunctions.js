const fs = require('fs');
const path = require('path');

// Directory to scan (update this to your folder path)
const directoryPath = path.join(__dirname, 'src');

// Regex to match function definitions
const functionRegex = /^\s*function\s+(\w+)\s*\(/gm;

// Object to store function names grouped by folder and file
const functionsByFolder = {};

// Recursively scan files in the directory
function scanDirectory(directory, relativePath = '') {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectory(filePath, path.join(relativePath, file));
    } else if (file.endsWith('.js')) {
      // Process JavaScript files
      const content = fs.readFileSync(filePath, 'utf-8');
      const folderPath = relativePath || '.';
      functionsByFolder[folderPath] = functionsByFolder[folderPath] || {};
      functionsByFolder[folderPath][file] = functionsByFolder[folderPath][file] || [];
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        functionsByFolder[folderPath][file].push(match[1]); // Add the function name to the list for this file
      }
    }
  });
}

// Start scanning the directory
scanDirectory(directoryPath);

// Format the output in GFM
let output = '';
for (const [folder, files] of Object.entries(functionsByFolder)) {
  if (folder.includes('legacy')) {
    output += `> [!IMPORTANT]\n> This folder is ignored by .clasp and does not push to AppsScript.\n\n`;
  }
  output += `## Folder: ${folder}\n\n`;
  for (const [fileName, functions] of Object.entries(files)) {
    output += ` - ### ${fileName}\n`;
    functions.forEach(func => {
      output += `  - ${func}\n`;
    });
    output += '\n';
  }
}

// Export grouped function names to a Markdown file
const outputFilePath = path.join(__dirname, 'functionNamesWithLegacyFlag.md');
fs.writeFileSync(outputFilePath, output, 'utf-8');

console.log(`Grouped function names with folder structure saved to ${outputFilePath}`);