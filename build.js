#!/usr/bin/env node
// Builds the student version (site root) and the teacher version (teacher/) from src/.
// Run:  node build.js
// Source of truth: src/info.js (all text, facts, quotations and discussion questions), src/sources.js (source list),
//   src/app.js (page code), src/index.html (page shell), src/styles.css, and images/.
// src/folklore.js holds the Folklore and legends section (folklore data, extra sources, and folkTeach teacher prompts).
// Student build removes: the "discuss", "teacherNotes" and "folkTeach" data, app.js blocks between /*T*/ markers,
//   and index.html blocks between <!--T--> markers. The student files hold no discussion answers.
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
global.window = {};
for (const f of ['info', 'sources', 'folklore']) { const fp = path.join(src, f + '.js'); if (fs.existsSync(fp)) require(fp); }
const INFO = JSON.parse(JSON.stringify(window.INFO));

function studentData(D) { delete D.discuss; delete D.teacherNotes; delete D.folkTeach; return D; }
function codeMode(s, mode) {
  if (mode === 'student') s = s.replace(/\/\*T\*\/[\s\S]*?\/\*\/T\*\//g, '');
  return s.replace(/\/\*\/?T\*\//g, '');
}
function htmlMode(s, mode) {
  if (mode === 'student') s = s.replace(/<!--T-->[\s\S]*?<!--\/T-->/g, '');
  s = s.replace(/<!--\/?T-->/g, '');
  const rep = { TITLE: INFO.title, SUB: INFO.subtitle, DESC: INFO.description, LEFT: INFO.dateLeft, RIGHT: INFO.dateRight, THEME: INFO.theme, THEMEHEX: INFO.theme.replace('#', '') };
  for (const k in rep) s = s.split('{{' + k + '}}').join(rep[k].replace(/&/g, '&amp;').replace(/"/g, '&quot;'));
  if (mode === 'teacher') s = s.replace('<meta name="theme-color"', '<meta name="robots" content="noindex">\n<meta name="theme-color"');
  return s;
}
function out(dir, mode) {
  fs.mkdirSync(dir, { recursive: true });
  let D = JSON.parse(JSON.stringify(INFO));
  if (mode === 'student') D = studentData(D);
  fs.writeFileSync(path.join(dir, 'data.js'), 'window.INFO=' + JSON.stringify(D) + ';\n');
  fs.writeFileSync(path.join(dir, 'app.js'), codeMode(fs.readFileSync(path.join(src, 'app.js'), 'utf8'), mode));
  fs.writeFileSync(path.join(dir, 'index.html'), htmlMode(fs.readFileSync(path.join(src, 'index.html'), 'utf8'), mode));
  fs.copyFileSync(path.join(src, 'styles.css'), path.join(dir, 'styles.css'));
  fs.mkdirSync(path.join(dir, 'images'), { recursive: true });
  for (const f of fs.readdirSync(path.join(root, 'images'))) fs.copyFileSync(path.join(root, 'images', f), path.join(dir, 'images', f));
}
out(root, 'student');
out(path.join(root, 'teacher'), 'teacher');
console.log('built student (/) and teacher (/teacher/)');
