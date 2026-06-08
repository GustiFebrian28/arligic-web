const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const runtimePath = path.join(projectRoot, '.next', 'server', 'webpack-runtime.js');
const chunksDir = path.join(projectRoot, '.next', 'server', 'chunks');
const serverDir = path.join(projectRoot, '.next', 'server');

if (!fs.existsSync(runtimePath)) {
  console.error(`Cannot find webpack-runtime.js at ${runtimePath}`);
  process.exit(1);
}

const content = fs.readFileSync(runtimePath, 'utf8');
const patched = content.replace(
  'return "" + chunkId + ".js";',
  'return "chunks/" + chunkId + ".js";'
);

if (content === patched) {
  console.log('webpack-runtime.js already patched');
} else {
  fs.writeFileSync(runtimePath, patched, 'utf8');
  console.log('Patched webpack-runtime.js to load server chunks from ./chunks/');
}

if (fs.existsSync(chunksDir)) {
  const chunkFiles = fs.readdirSync(chunksDir).filter((file) => file.endsWith('.js'));
  let copied = 0;
  for (const file of chunkFiles) {
    const src = path.join(chunksDir, file);
    const dest = path.join(serverDir, file);
    try {
      fs.copyFileSync(src, dest);
      copied += 1;
    } catch (error) {
      // ignore individual copy errors
    }
  }
  if (copied > 0) {
    console.log(`Copied ${copied} server chunk files to .next/server/`);
  }
}
