// Choose-your-path engine. Data comes from data.js (window.APP).
// Teacher-only code sits between the T markers and is removed from the student build.
(function () {
'use strict';
var A = window.APP;
var main = document.getElementById('main'), nav = document.getElementById('nav'), live = document.getElementById('live');
var KEY = 'path-app-' + A.id + (document.title.indexOf('Teacher') > -1 ? '-t' : '');
var st = load();
function load() { try { var s = JSON.parse(sessionStorage.getItem(KEY)); if (s && s.hist) return s; } catch (e) {} return { hist: [], notes: {} }; }
function save() { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'text') e.textContent = attrs[k];
    else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}
function P(t) { return el('p', { text: t }); }
function badge(kind, text) { return el('span', { class: 'badge ' + (kind === 'real' ? 'b-real' : 'b-made'), text: text }); }

var TABS = [['story', 'Story'], ['behind', 'Behind the Story'], ['sources', 'Sources'], ['discuss', 'Discuss and write']/*T*/, ['map', 'Story map']/*/T*/];

function route() {
  var h = (location.hash || '#/story').replace(/^#\/?/, '').split('/');
  return { page: h[0] || 'story', id: h[1] || null };
}
function curFlags() { return st.hist.length ? st.hist[st.hist.length - 1].flags : {}; }
function matches(cond, flags) { for (var k in cond) if (flags[k] !== cond[k]) return false; return true; }

function renderNav(page) {
  nav.innerHTML = '';
  TABS.forEach(function (t) {
    var a = el('a', { href: '#/' + t[0], text: t[1] });
    if (t[0] === page) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
}

function srcLinks(keys) {
  if (!keys || !keys.length) return null;
  var p = el('p', { class: 'srcs' }, ['Sources: ']);
  keys.forEach(function (k, i) {
    var s = A.sources[k]; if (!s) return;
    if (i) p.appendChild(document.createTextNode('; '));
    p.appendChild(el('a', { href: '#/sources/' + k, text: s.short }));
  });
  return p;
}

function figure(key) {
  var im = A.images[key]; if (!im) return null;
  var cap = el('figcaption', null, [im.caption + ' ', el('span', { text: 'Credit: ' + im.credit + '. ' }), el('a', { href: im.url, rel: 'noopener', text: 'Source and licence (' + im.lic + ')' })]);
  return el('figure', { class: im.tall ? 'tall' : '' }, [el('img', { src: 'images/' + im.file, alt: im.alt, width: im.w, height: im.h, loading: 'lazy' }), cap]);
}

function factBox(f) {
  var box = el('div', { class: 'panel real' }, [badge('real', 'Real history'), el('h3', { text: f.h })]);
  f.text.forEach(function (t) { box.appendChild(P(t)); });
  var s = srcLinks(f.src); if (s) box.appendChild(s);
  return box;
}

function renderStory(id) {
  var node = A.nodes[id] || A.nodes[A.start]; id = node.id;
  if (id === A.start) st.hist = [];
  var idx = -1;
  st.hist.forEach(function (h, i) { if (h.id === id) idx = i; });
  if (idx > -1) st.hist = st.hist.slice(0, idx + 1);
  else {
    var prev = st.hist.length ? st.hist[st.hist.length - 1].flags : {};
    st.hist.push({ id: id, flags: Object.assign({}, prev, st.pending || {}) });
  }
  st.pending = null; save();
  var flags = curFlags();
  var w = el('div', { class: 'story' });
  w.appendChild(el('h1', { tabindex: '-1', text: node.title }));
  if (node.where) w.appendChild(el('p', { class: 'where', text: node.where }));
  if (node.care) w.appendChild(el('p', { class: 'carenote', role: 'note', text: node.care }));
  if (id === A.start) {
    var c = el('div', { class: 'care' }, [el('h2', { text: 'Before you start' })]);
    A.warning.forEach(function (t) { c.appendChild(P(t)); });
    w.appendChild(c);
  }
  if (node.img) { var f = figure(node.img); if (f) w.appendChild(f); }
  var tp = el('div', null, [badge('made', id === A.start ? 'About this story' : 'Invented story')]);
  w.appendChild(tp);
  node.text.forEach(function (t) {
    if (typeof t === 'string') w.appendChild(P(t));
    else if (matches(t.if, flags)) w.appendChild(P(t.t));
  });
  if (node.end) {
    var e = el('div', { class: 'end' }, [el('h2', { text: 'The end: ' + node.endTitle })]);
    w.appendChild(e);
  }
  if (node.fact) w.appendChild(factBox(node.fact));
  if (node.fact2) w.appendChild(factBox(node.fact2));
  /*T*/
  if (node.teacher) w.appendChild(teacherNote(node.teacher));
  /*/T*/
  if (node.choices && node.choices.length) {
    var ul = el('ul', { class: 'choices' });
    node.choices.forEach(function (ch) {
      if (ch.if && !matches(ch.if, flags)) return;
      var b = el('button', { class: 'choice', type: 'button', text: ch.t, onclick: function () { st.pending = ch.set || null; save(); location.hash = '#/story/' + ch.to; } });
      ul.appendChild(el('li', null, [b]));
    });
    w.appendChild(el('h2', { class: 'noprint', text: 'What do you do?' }));
    w.appendChild(ul);
  }
  var row = el('div', { class: 'row' });
  if (st.hist.length > 1) row.appendChild(el('button', { class: 'btn', type: 'button', text: 'Go back one step', onclick: function () { location.hash = '#/story/' + st.hist[st.hist.length - 2].id; } }));
  if (id !== A.start) row.appendChild(el('button', { class: 'btn', type: 'button', text: 'Start again', onclick: function () { st.hist = []; save(); location.hash = '#/story/' + A.start; } }));
  if (node.end) {
    row.appendChild(el('a', { class: 'btn dark', href: '#/behind', text: 'Read Behind the Story' }));
    row.appendChild(el('a', { class: 'btn dark', href: '#/discuss', text: 'Discuss and write' }));
  }
  w.appendChild(row);
  if (st.hist.length > 1) {
    var tr = el('div', { class: 'trail' }, [el('strong', { text: 'Your path so far' })]);
    var ol = el('ol');
    st.hist.forEach(function (h) { ol.appendChild(el('li', { text: A.nodes[h.id].title })); });
    tr.appendChild(ol); w.appendChild(tr);
  }
  return w;
}

/*T*/
function teacherNote(t) {
  var box = el('div', { class: 'tnote' });
  var body = el('div', { hidden: 'hidden' });
  body.appendChild(el('h3', { text: 'Teacher notes' }));
  t.forEach(function (x) { body.appendChild(P(x)); });
  var b = el('button', { class: 'btn tbtn', type: 'button', 'aria-expanded': 'false', text: 'Show teacher notes', onclick: function () {
    var open = body.hasAttribute('hidden');
    if (open) body.removeAttribute('hidden'); else body.setAttribute('hidden', 'hidden');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.textContent = open ? 'Hide teacher notes' : 'Show teacher notes';
  } });
  box.appendChild(b); box.appendChild(body);
  return box;
}
function renderMap() {
  var w = el('div');
  w.appendChild(el('h1', { text: 'Story map (teacher only)' }));
  w.appendChild(P('Every part of the story, with the choices that lead out of it. Use it to plan a lesson or to check that each ending can be reached.'));
  var tbl = el('table'), hd = el('tr');
  ['Part', 'Where and when', 'Choices lead to'].forEach(function (x) { hd.appendChild(el('th', { text: x })); });
  tbl.appendChild(hd);
  A.order.forEach(function (id) {
    var n = A.nodes[id], tr = el('tr');
    var a = el('a', { href: '#/story/' + id, text: n.title });
    tr.appendChild(el('td', null, [a, n.end ? el('span', { text: ' (ending)' }) : null]));
    tr.appendChild(el('td', { text: n.where || '' }));
    var td = el('td');
    (n.choices || []).forEach(function (c, i) { td.appendChild(el('div', null, [A.nodes[c.to].title])); });
    if (n.end) td.textContent = 'Ending';
    tr.appendChild(td); tbl.appendChild(tr);
  });
  w.appendChild(tbl);
  return w;
}
/*/T*/

function renderBehind() {
  var b = A.behind, w = el('div');
  w.appendChild(el('h1', { tabindex: '-1', text: 'Behind the Story' }));
  w.appendChild(P(b.intro));
  b.sections.forEach(function (s) {
    var kind = s.kind || 'real';
    var box = el('div', { class: 'panel ' + (kind === 'made' ? 'made' : kind === 'care' ? 'check' : 'real') }, [el('h2', { text: s.h })]);
    if (kind === 'made') box.insertBefore(badge('made', 'Invented'), box.firstChild);
    if (kind === 'real') box.insertBefore(badge('real', 'Real'), box.firstChild);
    (s.p || []).forEach(function (t) { box.appendChild(P(t)); });
    if (s.list) { var ul = el('ul'); s.list.forEach(function (t) { ul.appendChild(el('li', { text: t })); }); box.appendChild(ul); }
    w.appendChild(box);
  });
  return w;
}

function renderSources(focus) {
  var w = el('div');
  w.appendChild(el('h1', { tabindex: '-1', text: 'Sources' }));
  w.appendChild(P(A.sourcesIntro));
  var ol = el('ol', { class: 'src' });
  Object.keys(A.sources).forEach(function (k) {
    var s = A.sources[k];
    var li = el('li', { id: 'src-' + k }, [el('a', { href: s.u, rel: 'noopener', text: s.t }), ' ' + s.note]);
    if (k === focus) li.setAttribute('style', 'background:#efe2c4');
    ol.appendChild(li);
  });
  w.appendChild(ol);
  w.appendChild(el('h2', { text: 'Image credits' }));
  var ul = el('ul', { class: 'src' });
  Object.keys(A.images).forEach(function (k) {
    var im = A.images[k];
    ul.appendChild(el('li', null, [im.caption + ' ' + im.credit + '. ', el('a', { href: im.url, rel: 'noopener', text: 'Source (' + im.lic + ')' })]));
  });
  w.appendChild(ul);
  w.appendChild(P(A.imageNote));
  if (focus) setTimeout(function () { var x = document.getElementById('src-' + focus); if (x) x.scrollIntoView(); }, 30);
  return w;
}

function renderDiscuss() {
  var w = el('div');
  w.appendChild(el('h1', { tabindex: '-1', text: 'Discuss and write' }));
  w.appendChild(P('Use the story, the Real history boxes and the Sources page to answer these questions. Your answers stay in this browser tab. Nothing is sent anywhere. Use the print button to print or save your answers.'));
  w.appendChild(el('div', { class: 'row noprint' }, [el('button', { class: 'btn dark', type: 'button', text: 'Print or save as PDF', onclick: function () { window.print(); } })]));
  A.discuss.forEach(function (g) {
    w.appendChild(el('h2', { text: g.h }));
    g.qs.forEach(function (q, i) {
      var id = g.id + i;
      var box = el('div', { class: 'q' });
      box.appendChild(el('p', null, [el('span', { class: 'qn', text: (q.n) + '. ' }), q.q]));
      var ta = el('textarea', { id: 'ta-' + id, 'aria-label': 'Your answer to question ' + q.n });
      ta.value = st.notes[id] || '';
      ta.addEventListener('input', function () { st.notes[id] = ta.value; save(); });
      box.appendChild(ta);
      /*T*/
      if (q.answer) {
        var ans = el('div', { class: 'tnote', hidden: 'hidden' }, [el('h3', { text: 'Suggested answer' })]);
        q.answer.forEach(function (x) { ans.appendChild(P(x)); });
        var b = el('button', { class: 'btn tbtn', type: 'button', 'aria-expanded': 'false', text: 'Show suggested answer', onclick: function () {
          var open = ans.hasAttribute('hidden');
          if (open) ans.removeAttribute('hidden'); else ans.setAttribute('hidden', 'hidden');
          b.setAttribute('aria-expanded', open ? 'true' : 'false');
          b.textContent = open ? 'Hide suggested answer' : 'Show suggested answer';
        } });
        box.appendChild(el('div', { class: 'row noprint' }, [b])); box.appendChild(ans);
      }
      /*/T*/
      w.appendChild(box);
    });
  });
  return w;
}

function render() {
  var r = route(), page = r.page, body;
  if (page === 'story') body = renderStory(r.id || A.start);
  else if (page === 'behind') body = renderBehind();
  else if (page === 'sources') body = renderSources(r.id);
  else if (page === 'discuss') body = renderDiscuss();
  /*T*/ else if (page === 'map') body = renderMap(); /*/T*/
  else body = renderStory(A.start);
  renderNav(page);
  main.innerHTML = ''; main.appendChild(body);
  var h = main.querySelector('h1'); if (h && page !== 'sources') { h.setAttribute('tabindex', '-1'); }
  if (page !== 'sources') { window.scrollTo(0, 0); if (h) h.focus({ preventScroll: true }); }
  live.textContent = (h ? h.textContent : '') + ' page shown';
  document.getElementById('foot').innerHTML = '';
  document.getElementById('foot').appendChild(P(A.footer));
}
window.addEventListener('hashchange', render);
render();
})();
