#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read version from package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

// Path to the built file
const builtFilePath = path.join(__dirname, "..", "dist", "navi.js");

// Check if built file exists
if (!fs.existsSync(builtFilePath)) {
  console.error("❌ Built file not found at:", builtFilePath);
  process.exit(1);
}

// Read the built file
const builtFileContent = fs.readFileSync(builtFilePath, "utf8");

// Replace __VERSION_TOKEN__ with actual version
const updatedContent = builtFileContent.replace(/__VERSION_TOKEN__/g, version);

// Write the updated content back
fs.writeFileSync(builtFilePath, updatedContent, "utf8");

console.log(`✅ Navi CDN bundle built successfully (v${version})`);
console.log(`🔄 Version token replaced: __VERSION_TOKEN__ → ${version}`);
