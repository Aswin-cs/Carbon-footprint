const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// List of all SVGs in public directory
const decorative = [
  'dry_flower.svg', 'dry_plant.svg', 'dry_sun.svg', 'dry_tree.svg',
  'flower.svg', 'plant.svg', 'sun.svg', 'tree.svg'
];

const informative = ['logo.svg'];

decorative.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('aria-hidden="true"')) {
      content = content.replace(/<svg\s/, '<svg aria-hidden="true" ');
      fs.writeFileSync(filePath, content);
      console.log(`Added aria-hidden to ${file}`);
    }
  }
});

informative.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('<title>Carbon Footprint Tracker Logo</title>')) {
      content = content.replace(/<svg\s/, '<svg role="img" aria-label="Carbon Footprint Tracker Logo" ');
      content = content.replace(/(<svg[^>]*>)/, '$1<title>Carbon Footprint Tracker Logo</title>');
      fs.writeFileSync(filePath, content);
      console.log(`Added title and role to ${file}`);
    }
  }
});

console.log('SVG processing complete.');
