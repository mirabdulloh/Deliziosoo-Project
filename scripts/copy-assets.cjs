const path = require("path");

let fsExtra = null;
try {
  fsExtra = require("fs-extra");
} catch (_error) {
  fsExtra = null;
}
const fs = require("fs");

const directoriesToCopy = [
  { source: "src/views", destination: "dist/views" },
  { source: "src/public", destination: "dist/public" },
];

async function copyDirectory(source, destination) {
  const sourcePath = path.resolve(__dirname, "..", source);
  const destinationPath = path.resolve(__dirname, "..", destination);

  if (fsExtra) {
    await fsExtra.copy(sourcePath, destinationPath, { overwrite: true });
    return;
  }

  await fs.promises.mkdir(destinationPath, { recursive: true });
  await fs.promises.cp(sourcePath, destinationPath, {
    force: true,
    recursive: true,
  });
}

async function copyDirectories() {
  try {
    for (const directory of directoriesToCopy) {
      await copyDirectory(directory.source, directory.destination);
    }

    console.log(
      fsExtra
        ? "Successfully duplicated build assets with fs-extra."
        : "Successfully duplicated build assets with Node fallback.",
    );
  } catch (error) {
    console.error("Error copying build assets:", error);
    process.exitCode = 1;
  }
}

copyDirectories();
