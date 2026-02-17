#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const libVersion = process.env.WX_LIB_VERSION || '3.14.2';

const projectConfigFiles = [
  path.join(ROOT, 'project.config.json'),
  path.join(ROOT, 'build', 'wechatgame', 'project.config.json'),
];

const privateConfigFiles = [
  path.join(ROOT, 'project.private.config.json'),
  path.join(ROOT, 'build', 'wechatgame', 'project.private.config.json'),
];

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function fixProjectConfig(file) {
  const data = readJsonIfExists(file);
  if (!data) {
    return false;
  }
  data.libVersion = String(libVersion);
  writeJson(file, data);
  return true;
}

function fixPrivateConfig(file) {
  const data = readJsonIfExists(file) ?? {
    projectname: 'wechatgame',
    setting: {},
  };
  data.libVersion = String(libVersion);
  writeJson(file, data);
  return true;
}

let touched = 0;
for (const file of projectConfigFiles) {
  if (fixProjectConfig(file)) {
    touched += 1;
    console.log(`fixed: ${file}`);
  }
}

for (const file of privateConfigFiles) {
  if (fixPrivateConfig(file)) {
    touched += 1;
    console.log(`fixed: ${file}`);
  }
}

if (touched === 0) {
  console.log('no config file found');
} else {
  console.log(`done, libVersion=${libVersion}`);
}
