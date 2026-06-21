const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [search, replace] of replacements) {
    // using global replace
    content = content.split(search).join(replace);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const files = [
  path.join(__dirname, 'app', 'page.tsx'),
  path.join(__dirname, 'app', 'tracker', 'page.tsx'),
  path.join(__dirname, 'app', 'insight', 'page.tsx'),
  path.join(__dirname, 'components', 'quick-tracker.tsx')
];

const replacements = [
  // Buttons
  ['bg-emerald-600 text-white', 'bg-emerald-700 text-white'],
  ['hover:bg-emerald-700', 'hover:bg-emerald-800'],
  
  // Tiny uppercase labels
  ['text-slate-400 uppercase tracking-wider', 'text-slate-500 uppercase tracking-wider'],
  ['text-slate-500 dark:text-slate-400 uppercase tracking-wider', 'text-slate-600 dark:text-slate-400 uppercase tracking-wider'],
  ['text-slate-600 dark:text-slate-400 uppercase tracking-wider', 'text-slate-700 dark:text-slate-400 uppercase tracking-wider'], // If any existed
  
  // Badges
  ['text-emerald-600 bg-emerald-50', 'text-emerald-700 bg-emerald-50'],
  ['text-amber-600 bg-amber-50', 'text-amber-700 bg-amber-50'],
  
  // Toggle buttons on gray background
  ['text-slate-500 hover:text-slate-700', 'text-slate-600 hover:text-slate-800']
];

files.forEach(file => replaceInFile(file, replacements));
console.log('Contrast fixes applied.');
