#!/usr/bin/env node
/* eslint-disable no-useless-escape */
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

// Paths
const appRoot = path.resolve(__dirname, "..");
const pkgPath = path.join(appRoot, "package.json");
const appJsonPath = path.join(appRoot, "app.json");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function backupFile(originalPath) {
  const backupPath = originalPath + ".bak";
  fs.copyFileSync(originalPath, backupPath);
  return backupPath;
}

function restoreBackup(originalPath) {
  const backupPath = originalPath + ".bak";
  if (!fs.existsSync(backupPath)) {
    return false;
  }
  fs.copyFileSync(backupPath, originalPath);
  fs.unlinkSync(backupPath);
  return true;
}

function incrementStringNumber(str) {
  const n = parseInt(str, 10);
  if (!isNaN(n)) return String(n + 1);
  return str;
}

function bumpVersionString(version) {
  // Increment patch. Carry into minor when patch > 9, carry into major when minor > 9.
  const parts = version.split(".").map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);

  parts[2] = parts[2] + 1;

  for (let i = parts.length - 1; i > 0; i--) {
    if (parts[i] > 9) {
      parts[i] = 0;
      parts[i - 1] = (parts[i - 1] || 0) + 1;
    }
  }

  return parts.join(".");
}

function bump() {
  if (!fs.existsSync(pkgPath)) {
    console.error("package.json not found at", pkgPath);
    process.exit(1);
  }

  if (!fs.existsSync(appJsonPath)) {
    console.error("app.json not found at", appJsonPath);
    process.exit(1);
  }

  // --- package.json ---
  const pkg = readJSON(pkgPath);
  const currentVersion = pkg.version;
  if (!currentVersion) {
    console.error("No version field in package.json");
    process.exit(1);
  }

  const newVersion = bumpVersionString(currentVersion);
  pkg.version = newVersion;

  // --- app.json ---
  const appJson = readJSON(appJsonPath);
  const expo = appJson.expo;

  if (!expo) {
    console.error("No expo field in app.json");
    process.exit(1);
  }

  // Backup both files before making any changes
  backupFile(pkgPath);
  backupFile(appJsonPath);
  console.log("Backups created (.bak files)");

  // Bump package.json
  writeJSON(pkgPath, pkg);
  console.log(`package.json version: ${currentVersion} -> ${newVersion}`);

  // Bump expo.version
  const prevExpoVersion = expo.version || "1.0.0";
  expo.version = newVersion;
  console.log(`app.json expo.version: ${prevExpoVersion} -> ${newVersion}`);

  // Bump ios.buildNumber (string integer)
  if (expo.ios) {
    const prevBuild = expo.ios.buildNumber || "1";
    const newBuild = incrementStringNumber(prevBuild);
    expo.ios.buildNumber = newBuild;
    console.log(`app.json ios.buildNumber: ${prevBuild} -> ${newBuild}`);
  } else {
    // ios block exists but no buildNumber — add it
    expo.ios = { ...(expo.ios || {}), buildNumber: "1" };
    console.log("app.json ios.buildNumber: (new) -> 1");
  }

  // Bump android.versionCode (integer)
  if (expo.android) {
    const prevCode = expo.android.versionCode ?? 1;
    const newCode = prevCode + 1;
    expo.android.versionCode = newCode;
    console.log(`app.json android.versionCode: ${prevCode} -> ${newCode}`);
  } else {
    expo.android = { ...(expo.android || {}), versionCode: 2 };
    console.log("app.json android.versionCode: (new) -> 2");
  }

  writeJSON(appJsonPath, appJson);
  console.log("\nDone. Run with 'revert' to undo this bump.");
}

function revert() {
  let anyRestored = false;

  if (restoreBackup(pkgPath)) {
    console.log("package.json restored from backup.");
    anyRestored = true;
  } else {
    console.warn("No package.json backup found — skipping.");
  }

  if (restoreBackup(appJsonPath)) {
    console.log("app.json restored from backup.");
    anyRestored = true;
  } else {
    console.warn("No app.json backup found — skipping.");
  }

  if (!anyRestored) {
    console.error(
      "No backups found. Run the script without arguments first to create backups."
    );
    process.exit(1);
  }

  console.log("\nRevert complete.");
}

function main() {
  const command = process.argv[2] || "bump";

  if (command === "bump" || command === undefined) {
    bump();
  } else if (command === "revert") {
    revert();
  } else {
    console.error(`Unknown command: ${command}`);
    console.error("Usage: node scripts/bump-version.js [bump|revert]");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
