const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const runtimePath = path.join(projectRoot, '.next', 'server', 'webpack-runtime.js');
const chunksDir = path.join(projectRoot, '.next', 'server', 'chunks');
const serverDir = path.join(projectRoot, '.next', 'server');

function patchRuntime() {
  if (!fs.existsSync(runtimePath)) {
    return false;
  }

  const content = fs.readFileSync(runtimePath, 'utf8');
  const patched = content.replace(
    'return "" + chunkId + ".js";',
    'return "chunks/" + chunkId + ".js";'
  );

  if (content === patched) {
    return false;
  }

  fs.writeFileSync(runtimePath, patched, 'utf8');
  console.log('Patched webpack-runtime.js to load server chunks from ./chunks/');
  return true;
}

function copyChunksToServerRoot() {
  if (!fs.existsSync(chunksDir)) {
    return false;
  }

  const chunkFiles = fs.readdirSync(chunksDir).filter((file) => file.endsWith('.js'));
  if (!chunkFiles.length) {
    return false;
  }

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
    return true;
  }
  return false;
}

function fixServerChunks() {
  const patched = patchRuntime();
  const copied = copyChunksToServerRoot();
  if (!patched && !copied) {
    return false;
  }
  return true;
}

function watchServerFiles() {
  const watchDir = path.join(projectRoot, '.next', 'server');
  if (!fs.existsSync(watchDir)) {
    return;
  }
  fs.watch(watchDir, { persistent: true }, (eventType, filename) => {
    if (!filename) {
      return;
    }
    if (filename === 'webpack-runtime.js' || filename === 'chunks') {
      setTimeout(() => {
        fixServerChunks();
      }, 100);
    }
  });
}

function startDev() {
  const child = spawn('npx', ['next', 'dev'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    }
    process.exit(code);
  });

  child.on('error', (error) => {
    console.error('Failed to start next dev:', error);
    process.exit(1);
  });

  setTimeout(() => {
    fixServerChunks();
    watchServerFiles();
  }, 1000);
}

startDev();
