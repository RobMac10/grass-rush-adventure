#!/usr/bin/env node
// Builds the student version (site root) and the teacher version (teacher/) from src/.
// Run:  node build.js
// Source of truth: src/data.js (story, facts, sources, questions), src/app.js (engine), src/index.html, src/styles.css.
// Teacher-only data: any key named "teacher" or "answer", and the "order" list. Teacher-only code: /*T*/ ... /*/T*/ in app.js, <!--T--> ... <!--/T--> in index.html.
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
global.window = {};
require(path.join(src, 'data.js'));
const APP = JSON.parse(JSON.stringify(window.APP));

function strip(v) {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === 'object') { const o = {}; for (const k in v) { if (k === 'teacher' || k === 'answer' || k === 'order') continue; o[k] = strip(v[k]); } return o; }
  return v;
}
function codeMode(s, mode) {
  if (mode === 'student') s = s.replace(/\/\*T\*\/[\s\S]*?\/\*\/T\*\//g, '');
  return s.replace(/\/\*\/?T\*\//g, '');
}
function htmlMode(s, mode) {
  if (mode === 'student') s = s.replace(/<!--T-->[\s\S]*?<!--\/T-->/g, '');
  s = s.replace(/<!--\/?T-->/g, '');
  const rep = { TITLE: APP.title, SUB: APP.subtitle, DESC: APP.description, LEFT: APP.dateLeft, RIGHT: APP.dateRight };
  for (const k in rep) s = s.split('{{' + k + '}}').join(rep[k].replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
  if (mode === 'teacher') s = s.replace('<meta name="theme-color"', '<meta name="robots" content="noindex">\n<meta name="theme-color"');
  return s;
}
function out(dir, mode) {
  fs.mkdirSync(dir, { recursive: true });
  const data = mode === 'student' ? strip(APP) : APP;
  fs.writeFileSync(path.join(dir, 'data.js'), 'window.APP=' + JSON.stringify(data) + ';\n');
  fs.writeFileSync(path.join(dir, 'app.js'), codeMode(fs.readFileSync(path.join(src, 'app.js'), 'utf8'), mode));
  fs.writeFileSync(path.join(dir, 'index.html'), htmlMode(fs.readFileSync(path.join(src, 'index.html'), 'utf8'), mode));
  fs.copyFileSync(path.join(src, 'styles.css'), path.join(dir, 'styles.css'));
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  for (const f of fs.readdirSync(path.join(root, 'images'))) fs.copyFileSync(path.join(root, 'images', f), path.join(dir, 'images', f));
}
out(root, 'student');
out(path.join(root, 'teacher'), 'teacher');
// sanity checks
const stu = fs.readFileSync(path.join(root, 'data.js'), 'utf8') + fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (/Suggested answer|Teacher notes|"teacher"|"answer"/.test(stu)) { console.error('Teacher text found in the student build'); process.exit(1); }
console.log('Built student (root) and teacher (teacher/).');
