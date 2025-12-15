const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const archiver = require('archiver');

const output = createWriteStream(path.join(__dirname, '../public/extension.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Extension packaged: ${archive.pointer()} bytes`);
  console.log('Extension zip created successfully at public/extension.zip');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all extension files
const extensionDir = __dirname;
const files = [
  'manifest.json',
  'content.js',
  'background.js',
  'popup.html',
  'popup.js',
  'icon16.png',
  'icon48.png',
  'icon128.png',
  'README.md',
  'INSTALL.md'
];

files.forEach(file => {
  const filePath = path.join(extensionDir, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
  }
});

archive.finalize();
