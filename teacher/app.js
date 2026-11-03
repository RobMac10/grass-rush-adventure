(function () {
  'use strict';
  var D = window.INFO;
  var main = document.getElementById('main'), nav = document.getElementById('nav'), foot = document.getElementById('foot');

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'class') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function p(t, cls) { return el('p', cls ? { 'class': cls, text: t } : { text: t }); }
  function ul(list, cls) { var u = el('ul', cls ? { 'class': cls } : null); list.forEach(function (t) { u.appendChild(el('li', { text: t })); }); return u; }
  function paras(list) { return (list || []).map(function (t) { return p(t); }); }

  function srcLinks(keys) {
    if (!keys || !keys.length) return null;
    var wrap = el('span', { 'class': 'srcs' }, [el('span', { text: 'Source: ' })]);
    keys.forEach(function (k, i) {
      var s = D.sources[k];
      if (!s) return;
      if (i) wrap.appendChild(document.createTextNode('; '));
      wrap.appendChild(el('a', { href: s.u, target: '_blank', rel: 'noopener', text: s.short }));
    });
    return wrap;
  }
  function srcP(keys) { var s = srcLinks(keys); return s ? el('p', { 'class': 'srcline' }, [s]) : null; }

  function figure(key) {
    var im = D.images && D.images[key];
    if (!im) return null;
    var fig = el('figure', im.tall ? { 'class': 'tall' } : null);
    fig.appendChild(el('img', { src: im.file, alt: im.alt, loading: 'lazy', width: im.w || '', height: im.h || '' }));
    fig.appendChild(el('figcaption', null, [
      document.createTextNode(im.caption + ' Credit: ' + im.credit + '. '),
      el('a', { href: im.url, target: '_blank', rel: 'noopener', text: 'Image page' })
    ]));
    if (!im.people) return fig;
    var d = el('details', { 'class': 'panel viewpic' });
    d.appendChild(el('summary', { text: 'View photograph: ' + (im.summary || 'it shows people who have died') }));
    d.appendChild(p('This photograph shows people who have died. You can choose whether to look at it. It is a public domain image and there are no AI images in this resource.'));
    d.appendChild(fig);
    return d;
  }

  function badge(text, cls) { return el('span', { 'class': 'badge ' + (cls || ''), text: text }); }

  
  function toggle(label, content) {
    var id = 't' + Math.random().toString(36).slice(2, 8);
    var b = el('button', { type: 'button', 'class': 'btn small tog', 'aria-expanded': 'false', 'aria-controls': id, text: 'Show ' + label });
    var box = el('div', { id: id, 'class': 'tbox', hidden: '' });
    box.appendChild(content);
    b.addEventListener('click', function () {
      var open = box.hasAttribute('hidden');
      if (open) box.removeAttribute('hidden'); else box.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.textContent = (open ? 'Hide ' : 'Show ') + label;
    });
    return el('div', { 'class': 'tgroup' }, [b, box]);
  }
  

  function setPage(title, nodes, hideH1) {
    main.innerHTML = '';
    var h = el('h1', { tabindex: '-1', text: title });
    main.appendChild(h);
    nodes.forEach(function (n) { if (n) main.appendChild(n); });
    main.appendChild(el('p', { 'class': 'homebar' }, [el('a', { 'class': 'btn dark big home', href: 'https://robmac10.github.io/history.html', text: '← Home' })]));
    document.title = title + ' · ' + D.title;
    window.scrollTo(0, 0);
    h.focus();
  }

  var SECTIONS = [
    ['#/', 'Overview'], ['#/timeline', 'Timeline'], ['#/places', 'Places'], ['#/map', 'Settlement map'], ['#/london', 'Money from London'], ['#/people', 'People and groups'],
    ['#/lives', 'Real lives'], ['#/know', 'Did you know'], ['#/folklore', 'Folklore and legends'], ['#/sources', 'Sources']
  ];
   SECTIONS.push(['#/discuss', 'Discussion questions']); 

  function renderNav(route) {
    nav.innerHTML = '';
    SECTIONS.forEach(function (it) {
      var a = el('a', { href: it[0], text: it[1] });
      if (it[0] === '#/' + route || (it[0] === '#/' && route === '')) a.setAttribute('aria-current', 'page');
      nav.appendChild(a);
    });
  }

  function warningPanel() {
    var w = el('div', { 'class': 'care', role: 'note' });
    w.appendChild(el('h2', { text: 'Content warning' }));
    D.warning.forEach(function (t, i) { w.appendChild(el('p', i === 0 ? { 'class': 'strong', text: t } : { text: t })); });
    w.appendChild(el('p', { 'class': 'review', text: D.review }));
    return w;
  }

  function viewOverview() {
    var O = D.overview, kids = [];
    kids.push(p(D.subtitle, 'lead'));
    kids.push(warningPanel());
    var hero = figure(O.image);
    if (hero) kids.push(hero);
    kids.push(p(O.lead, 'bigpara'));
    if (O.glance && O.glance.length) {
      kids.push(el('h2', { text: 'At a glance' }));
      var g = el('div', { 'class': 'glance' });
      O.glance.forEach(function (x) {
        g.appendChild(el('div', { 'class': 'stat' }, [el('b', { text: x.n }), el('span', { text: x.label }), x.src ? srcLinks(x.src) : null]));
      });
      kids.push(g);
    }
    O.sections.forEach(function (s) {
      kids.push(el('h2', { text: s.h }));
      s.p.forEach(function (t) { kids.push(p(t)); });
      if (s.src) kids.push(srcP(s.src));
    });
    if (O.words && O.words.length) {
      kids.push(el('h2', { text: 'Words used in this resource' }));
      var dl = el('dl', { 'class': 'words' });
      O.words.forEach(function (w) { dl.appendChild(el('dt', { text: w[0] })); dl.appendChild(el('dd', { text: w[1] })); });
      kids.push(dl);
    }
    if (O.left && O.left.length) {
      kids.push(el('div', { 'class': 'panel' }, [el('h2', { text: 'What this resource leaves out on purpose' }), ul(O.left)]));
    }
    kids.push(el('h2', { text: 'Explore' }));
    var tiles = el('div', { 'class': 'tiles' });
    var blurbs = {
      '#/timeline': 'Dated events, each with a short explanation and its source.',
      '#/places': 'The main places and what happened there.',
      '#/map': 'A map that shows pastoral settlement spreading north and west, decade by decade.',
      '#/london': 'The banks and companies that lent money for runs, and what happened when the money stopped.',
      '#/people': 'Real people, groups and organisations named in the sources.',
      '#/lives': 'Short accounts of real people from the records.',
      '#/know': 'Facts from the sources that are worth knowing.',
      '#/folklore': 'Yarns and legends from the period. All are labelled as unproven.',
      '#/sources': 'Every source used, and where sources disagree.'
    };
    SECTIONS.slice(1, 10).forEach(function (s) {
      tiles.appendChild(el('a', { 'class': 'tile', href: s[0] }, [el('b', { text: s[1] }), el('span', { text: blurbs[s[0]] })]));
    });
    kids.push(tiles);
     kids.push(el('p', { 'class': 'note', text: 'Teacher version. Discussion questions with suggested answers are on the “Discussion questions” page, behind “Show” buttons.' })); 
    setPage(D.title, kids);
  }

  function viewTimeline() {
    var kids = [p('These are the key dated events in this history. Each has a short explanation and its source. Where sources give different dates or details, the entry says so.', 'lead')];
    var ol = el('ol', { 'class': 'tl' });
    D.timeline.forEach(function (e) {
      var li = el('li', e.flag ? { 'class': 'flagged' } : null);
      li.appendChild(el('span', { 'class': 'tl-date', text: e.date }));
      var body = el('div', { 'class': 'tl-body' });
      body.appendChild(el('h3', { text: e.title }));
      body.appendChild(p(e.text));
      if (e.flag) body.appendChild(el('p', { 'class': 'flag' }, [badge('Sources differ', 'b-flag'), document.createTextNode(e.flag)]));
      var s = srcLinks(e.src); if (s) body.appendChild(el('p', { 'class': 'srcline' }, [s]));
      li.appendChild(body);
      ol.appendChild(li);
    });
    kids.push(ol);
    setPage('Timeline', kids);
  }

  function viewPlaces() {
    var kids = [p('Places named in the sources, with what the sources say about them. Every place is on the Country of Aboriginal people.', 'lead')];
    D.places.forEach(function (pl) {
      var a = el('article', { 'class': 'card' });
      a.appendChild(el('h2', { text: pl.name }));
      if (pl.where) a.appendChild(el('p', { 'class': 'where', text: pl.where }));
      if (pl.image) a.appendChild(figure(pl.image));
      paras(pl.text).forEach(function (x) { a.appendChild(x); });
      var s = srcP(pl.src); if (s) a.appendChild(s);
      kids.push(a);
    });
    setPage('Places', kids);
  }

  function viewPeople() {
    var kids = [p('Only real people, groups and organisations that appear in the sources are listed here. Nobody has been invented. Where a person’s own name is not known, the entry says so.', 'lead')];
    var order = [['person', 'People'], ['group', 'Groups and communities'], ['org', 'Organisations, laws and official bodies']];
    order.forEach(function (o) {
      var items = D.people.filter(function (x) { return x.kind === o[0]; });
      if (!items.length) return;
      kids.push(el('h2', { text: o[1] }));
      var wrap = el('div', { 'class': 'cards' });
      items.forEach(function (x) {
        var a = el('article', { 'class': 'card small' });
        a.appendChild(el('h3', { text: x.name }));
        if (x.dates) a.appendChild(el('p', { 'class': 'where', text: x.dates }));
        a.appendChild(p(x.text));
        if (x.image) a.appendChild(figure(x.image));
        var s = srcP(x.src); if (s) a.appendChild(s);
        wrap.appendChild(a);
      });
      kids.push(wrap);
    });
    setPage('People and groups', kids);
  }

  function viewLives() {
    var kids = [p('Short accounts of real people, taken from records. A person’s own words are quoted only where a source records them. Spelling in quotations is as the source gives it.', 'lead')];
    D.lives.forEach(function (l) {
      var a = el('article', { 'class': 'card life' });
      a.appendChild(el('h2', { text: l.name }));
      if (l.dates) a.appendChild(el('p', { 'class': 'where', text: l.dates }));
      paras(l.text).forEach(function (x) { a.appendChild(x); });
      if (l.quote) {
        var bq = el('blockquote');
        l.quote.lines.forEach(function (t) { bq.appendChild(p('“' + t + '”')); });
        bq.appendChild(el('footer', { text: l.quote.by }));
        a.appendChild(bq);
        if (l.quote.note) a.appendChild(p(l.quote.note, 'small'));
      }
      if (l.after) paras(l.after).forEach(function (x) { a.appendChild(x); });
      if (l.flag) a.appendChild(el('p', { 'class': 'flag' }, [badge('Check', 'b-flag'), document.createTextNode(l.flag)]));
      if (l.image) a.appendChild(figure(l.image));
      var s = srcP(l.src); if (s) a.appendChild(s);
      kids.push(a);
    });
    setPage('Real lives', kids);
  }

  function viewKnow() {
    var kids = [p('Facts from the sources that are worth knowing.', 'lead')];
    var wrap = el('ol', { 'class': 'know' });
    D.know.forEach(function (k) {
      var li = el('li', null, [p(k.t)]);
      var s = srcP(k.src); if (s) li.appendChild(s);
      wrap.appendChild(li);
    });
    kids.push(wrap);
    setPage('Did you know', kids);
  }

  function viewFolklore() {
    var F = D.folklore, kids = [];
    kids.push(p(F.intro, 'lead'));
    var ban = el('div', { 'class': 'folkbanner', role: 'note' }, [el('h2', { text: F.banner.head })].concat(F.banner.text.map(function (t, i) { return el('p', i === 0 ? { 'class': 'strong', text: t } : { text: t }); })));
    kids.push(ban);
    F.stories.forEach(function (s, i) {
      var a = el('article', { 'class': 'card folk' });
      a.appendChild(badge('Folklore: unproven', 'b-folk'));
      a.appendChild(el('h2', { text: s.title }));
      if (s.where) a.appendChild(el('p', { 'class': 'where', text: s.where }));
      a.appendChild(el('h3', { text: 'The story' }));
      paras(s.text).forEach(function (x) { a.appendChild(x); });
      a.appendChild(el('div', { 'class': 'folkfrom' }, [el('h3', { text: 'Where it comes from' }), p(s.from)]));
      a.appendChild(el('div', { 'class': 'folkknown' }, [el('h3', { text: 'What we actually know' })].concat(paras(s.known))));
      var sl = srcP(s.src); if (sl) a.appendChild(sl);
      
      var T = D.folkTeach && D.folkTeach[i];
      if (T) {
        var tn = el('div', { 'class': 'tnote' }, [el('h3', { text: 'Teacher: discussion prompt' }), el('p', { 'class': 'strong', text: T.q })]);
        var notes = el('div'); T.a.forEach(function (t) { notes.appendChild(p(t)); });
        tn.appendChild(toggle('teacher notes', notes));
        a.appendChild(tn);
      }
      
      kids.push(a);
    });
    setPage('Folklore and legends', kids);
  }

  function viewSources() {
    var kids = [p(D.sourcesIntro, 'lead')];
    kids.push(el('div', { 'class': 'panel check' }, [el('h2', { text: 'Where sources disagree, or the record has gaps' }), ul(D.disagree)]));
    kids.push(el('div', { 'class': 'care' }, [el('h2', { text: 'Care and cultural review' })].concat(paras(D.care))));
    kids.push(el('h2', { text: 'Images' }));
    kids.push(p(D.imageNote));
    kids.push(el('h2', { text: 'Source list' }));
    var list = el('ul', { 'class': 'sourcelist' });
    Object.keys(D.sources).forEach(function (k) {
      var s = D.sources[k];
      var li = el('li', null, [document.createTextNode(s.t + ' '), el('a', { href: s.u, target: '_blank', rel: 'noopener', text: s.u })]);
      if (s.note) li.appendChild(el('span', { 'class': 'snote', text: ' ' + s.note }));
      list.appendChild(li);
    });
    kids.push(list);
    setPage('Sources', kids);
  }


  function viewLondon() {
    var L = D.london, kids = [];
    kids.push(p(L.lead, 'lead'));
    kids.push(el('div', { 'class': 'panel check' }, [el('h2', { text: 'How this page was checked' }), ul(L.how)]));
    kids.push(el('h2', { text: 'Who was really in Queensland?' }));
    kids.push(p('Each name below was checked against sources for its actual part in Queensland. The verdict is only about what the sources read for this page show.'));
    var wrap = el('div', { 'class': 'cards' });
    L.checks.forEach(function (c) {
      var a = el('article', { 'class': 'card small' });
      a.appendChild(el('h3', { text: c.name }));
      a.appendChild(el('p', { 'class': 'where' }, [badge(c.verdict, 'b-flag')]));
      a.appendChild(p(c.text));
      var s = srcP(c.src); if (s) a.appendChild(s);
      wrap.appendChild(a);
    });
    kids.push(wrap);
    L.sections.forEach(function (s) {
      kids.push(el('h2', { text: s.h }));
      s.p.forEach(function (t) { kids.push(p(t)); });
      if (s.flag) kids.push(el('p', { 'class': 'flag' }, [badge('Sources differ', 'b-flag'), document.createTextNode(s.flag)]));
      if (s.image) kids.push(figure(s.image));
      if (s.src) kids.push(srcP(s.src));
    });
    kids.push(el('h2', { text: 'What it meant for different people' }));
    L.means.forEach(function (m) {
      var a = el('article', { 'class': 'card' });
      a.appendChild(el('h3', { text: m.h }));
      m.p.forEach(function (t) { a.appendChild(p(t)); });
      var s = srcP(m.src); if (s) a.appendChild(s);
      kids.push(a);
    });
    kids.push(el('div', { 'class': 'panel' }, [el('h2', { text: 'What I could not find' }), ul(L.gaps)]));
     kids.push(el('p', { 'class': 'note', text: 'Teacher version. Discussion questions about this page, with suggested answers behind “Show” buttons, are on the “Discussion questions” page.' })); 
    setPage('Money from London', kids);
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, text) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  function viewMap() {
    var M = D.settlement, kids = [];
    var W0 = 137.9, N0 = -10.4, S = 44, K = 0.94, VW = 700, VH = Math.round((29.3 - 10.4) * S);
    function px(lon) { return Math.round((lon - W0) * K * S * 10) / 10; }
    function py(lat) { return Math.round((N0 - lat) * S * 10) / 10; }
    var state = { i: 0, view: 'map', sel: null };
    var steps = M.steps;

    kids.push(p(M.lead, 'lead'));
    kids.push(el('p', { 'class': 'keyline', text: M.line }));
    kids.push(p(M.lineNote, 'small'));
    kids.push(el('div', { 'class': 'panel check' }, [el('h2', { text: 'How to read this map' }), ul(M.how)]));

    var label = el('output', { 'class': 'mapdecade', 'aria-live': 'polite' });
    var back = el('button', { type: 'button', 'class': 'btn', text: '← Back' });
    var next = el('button', { type: 'button', 'class': 'btn', text: 'Next →' });
    var range = el('input', { type: 'range', min: '0', max: String(steps.length - 1), step: '1', value: '0', id: 'decaderange', 'aria-label': 'Decade, from the 1840s to the 1890s' });
    var rangeLabel = el('label', { 'for': 'decaderange', 'class': 'sr', text: 'Decade' });
    var bMap = el('button', { type: 'button', 'class': 'btn', 'aria-pressed': 'true', text: 'Map view' });
    var bList = el('button', { type: 'button', 'class': 'btn', 'aria-pressed': 'false', text: 'List view' });
    var ctl = el('div', { 'class': 'mapctl' }, [
      el('div', { 'class': 'mapstep' }, [back, rangeLabel, range, next]),
      label,
      el('div', { 'class': 'mapview' }, [bMap, bList])
    ]);
    kids.push(ctl);
    var ticks = el('div', { 'class': 'mapticks', 'aria-hidden': 'true' });
    steps.forEach(function (s) { ticks.appendChild(el('span', { text: s.label })); });
    kids.push(ticks);

    var stepText = el('div', { 'class': 'panel mapnote' });
    kids.push(stepText);

    var mapBox = el('div', { 'class': 'mapbox' });
    var svg = sv('svg', { viewBox: '0 0 ' + VW + ' ' + VH, role: 'img', 'aria-labelledby': 'maptitle mapdesc', 'class': 'qldmap' });
    svg.appendChild(sv('title', { id: 'maptitle' }, 'A simplified map of Queensland showing where pastoral districts had opened by the selected decade'));
    svg.appendChild(sv('desc', { id: 'mapdesc' }, 'Dots mark the approximate middle of each pastoral district. The list view gives the same information as text.'));
    var d = '';
    M.outline.forEach(function (ring) {
      ring.forEach(function (pt, i) { d += (i ? 'L' : 'M') + px(pt[0]) + ' ' + py(pt[1]); });
      d += 'Z';
    });
    svg.appendChild(sv('path', { d: d, 'class': 'map-land' }));
    var gulf = sv('text', { x: px(138.15), y: py(-14.6), 'class': 'map-sea' });
    gulf.appendChild(sv('tspan', { x: px(138.15), dy: 0 }, 'Gulf of'));
    gulf.appendChild(sv('tspan', { x: px(138.15), dy: 20 }, 'Carpentaria'));
    svg.appendChild(gulf);
    svg.appendChild(sv('text', { x: px(149.2), y: py(-16.2), 'class': 'map-sea' }, 'Coral Sea'));
    svg.appendChild(sv('text', { x: px(138.4), y: py(-22.5), 'class': 'map-sea', transform: 'rotate(-90 ' + px(138.4) + ' ' + py(-22.5) + ')' }, 'Northern Territory border'));
    [['Brisbane', 153.03, -27.47, -10, 22, 'end'], ['Rockhampton', 150.5, -23.38, -10, -10, 'end'], ['Townsville', 146.8, -19.26, -10, 4, 'end']].forEach(function (t) {
      svg.appendChild(sv('rect', { x: px(t[1]) - 4, y: py(t[2]) - 4, width: 8, height: 8, 'class': 'map-town' }));
      svg.appendChild(sv('text', { x: px(t[1]) + t[3], y: py(t[2]) + t[4], 'class': 'map-townname', 'text-anchor': t[5] }, t[0]));
    });
    var markLayer = sv('g', {});
    svg.appendChild(markLayer);
    var dotLayer = sv('g', {});
    svg.appendChild(dotLayer);
    mapBox.appendChild(svg);
    var detail = el('div', { 'class': 'panel mapdetail', 'aria-live': 'polite' });
    mapBox.appendChild(detail);
    kids.push(mapBox);

    var listBox = el('div', { 'class': 'maplist', hidden: '' });
    kids.push(listBox);

    kids.push(el('h2', { text: 'Where sources differ' }));
    var flagItems = M.flags.slice();
    M.districts.forEach(function (d) { if (d.flag) flagItems.push(d.name + ': ' + d.flag); });
    kids.push(el('div', { 'class': 'panel check' }, [ul(flagItems)]));
    kids.push(el('div', { 'class': 'panel' }, [el('h2', { text: 'What the map leaves out' }), ul(M.left), p(M.credit, 'small'), srcP(['naturalEarth'])]));

    function districtCard(d, isNew) {
      var a = el('article', { 'class': 'card small distcard' });
      a.appendChild(el('h3', { text: d.name }));
      var meta = el('p', { 'class': 'where' }, [document.createTextNode('First runs: ' + d.first + '. Gazetted: ' + d.gazetted + '. ')]);
      if (isNew) meta.appendChild(badge('New this decade', 'b-new'));
      a.appendChild(meta);
      a.appendChild(p(d.note));
      a.appendChild(el('p', null, [el('b', { text: 'Whose Country: ' }), document.createTextNode(d.country)]));
      if (d.flag) a.appendChild(el('p', { 'class': 'flag' }, [badge('Sources differ', 'b-flag'), document.createTextNode(d.flag)]));
      var s = srcP(d.src); if (s) a.appendChild(s);
      return a;
    }

    function draw() {
      var st = steps[state.i], dec = st.decade;
      label.textContent = 'The ' + st.label + ': ' + M.districts.filter(function (d) { return d.from < dec + 10; }).length + ' of ' + M.districts.length + ' districts have first runs';
      back.disabled = state.i === 0; next.disabled = state.i === steps.length - 1;
      range.value = String(state.i);
      stepText.innerHTML = '';
      stepText.appendChild(el('h2', { text: 'The ' + st.label }));
      stepText.appendChild(p(st.text));
      var ss = srcP(st.src); if (ss) stepText.appendChild(ss);
      var newOnes = M.districts.filter(function (d) { return d.from >= dec && d.from < dec + 10; });
      if (!newOnes.length) stepText.appendChild(p('No new district has its first runs in this decade on this map. Settlement in the districts already on the map carried on.', 'small'));
      if (state.sel && M.districts.filter(function (d) { return d.id === state.sel; })[0].from >= dec + 10) state.sel = null;
      if (!state.sel && newOnes.length) state.sel = newOnes[0].id;
      markLayer.innerHTML = '';
      (M.marks || []).forEach(function (m) {
        if (m.year >= dec + 10) return;
        var mg = sv('g', { 'class': 'mark' });
        mg.appendChild(sv('rect', { x: px(m.lon) - 5, y: py(m.lat) - 5, width: 10, height: 10, transform: 'rotate(45 ' + px(m.lon) + ' ' + py(m.lat) + ')', 'class': 'map-rail' }));
        mg.appendChild(sv('text', { x: px(m.lon) + m.dx, y: py(m.lat) + m.dy, 'text-anchor': m.anchor, 'class': 'map-townname' }, m.name + ' ' + m.year));
        markLayer.appendChild(mg);
      });
      dotLayer.innerHTML = '';
      M.districts.forEach(function (d) {
        if (d.from >= dec + 10) return;
        var isNew = d.from >= dec;
        var g = sv('g', { 'class': 'dist' + (isNew ? ' new' : '') + (state.sel === d.id ? ' sel' : ''), tabindex: '0', role: 'button', 'aria-label': d.name + ', first runs ' + d.first + (isNew ? ', new this decade' : '') });
        g.appendChild(sv('circle', { cx: px(d.lon), cy: py(d.lat), r: 30, 'class': 'halo' }));
        g.appendChild(sv('circle', { cx: px(d.lon), cy: py(d.lat), r: 9, 'class': 'dot' }));
        g.appendChild(sv('text', { x: px(d.lon) + d.dx, y: py(d.lat) + d.dy, 'text-anchor': d.anchor, 'class': 'dlabel' }, d.label || d.name));
        function pick() { state.sel = d.id; draw(); }
        g.addEventListener('click', pick);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        dotLayer.appendChild(g);
      });
      detail.innerHTML = '';
      var cur = state.sel ? M.districts.filter(function (d) { return d.id === state.sel; })[0] : null;
      if (cur) detail.appendChild(districtCard(cur, cur.from >= dec && cur.from < dec + 10));
      else detail.appendChild(p('Choose a dot on the map to read about that district.'));
      listBox.innerHTML = '';
      var vis = M.districts.filter(function (d) { return d.from < dec + 10; }).sort(function (x, y) { return x.from - y.from; });
      listBox.appendChild(el('h2', { text: 'Districts with first runs by the end of the ' + st.label + ' (' + vis.length + ')' }));
      vis.forEach(function (d) { listBox.appendChild(districtCard(d, d.from >= dec && d.from < dec + 10)); });
      var onMap = state.view === 'map';
      if (onMap) { mapBox.removeAttribute('hidden'); listBox.setAttribute('hidden', ''); } else { mapBox.setAttribute('hidden', ''); listBox.removeAttribute('hidden'); }
      bMap.setAttribute('aria-pressed', onMap ? 'true' : 'false');
      bList.setAttribute('aria-pressed', onMap ? 'false' : 'true');
    }
    back.addEventListener('click', function () { if (state.i > 0) { state.i--; state.sel = null; draw(); } });
    next.addEventListener('click', function () { if (state.i < steps.length - 1) { state.i++; state.sel = null; draw(); } });
    range.addEventListener('input', function () { state.i = parseInt(range.value, 10); state.sel = null; draw(); });
    bMap.addEventListener('click', function () { state.view = 'map'; draw(); });
    bList.addEventListener('click', function () { state.view = 'list'; draw(); });
    setPage('Settlement map', kids);
    draw();
  }

  
  function viewDiscuss() {
    var kids = [p('Suggested questions for class discussion or writing. Each suggested answer is behind a “Show” button.', 'lead')];
    kids.push(el('div', { 'class': 'panel teacher' }, [el('h2', { text: 'Notes for teachers' }), ul(D.teacherNotes)]));
    var ol = el('ol', { 'class': 'qs' });
    D.discuss.forEach(function (it) {
      var li = el('li', null, [el('p', { text: it.q })]);
      var ans = el('div');
      it.a.forEach(function (t) { ans.appendChild(p(t)); });
      li.appendChild(toggle('suggested answer', ans));
      ol.appendChild(li);
    });
    kids.push(ol);
    setPage('Discussion questions', kids);
  }
  

  function route() {
    var r = (location.hash || '#/').replace(/^#\/?/, '');
    renderNav(r);
    if (r === '') viewOverview();
    else if (r === 'timeline') viewTimeline();
    else if (r === 'places') viewPlaces();
    else if (r === 'map') viewMap();
    else if (r === 'london') viewLondon();
    else if (r === 'people') viewPeople();
    else if (r === 'lives') viewLives();
    else if (r === 'know') viewKnow();
    else if (r === 'folklore') viewFolklore();
    else if (r === 'sources') viewSources();
     else if (r === 'discuss') viewDiscuss(); 
    else viewOverview();
  }
  foot.appendChild(p(D.footnote));
  foot.appendChild(p(D.footer));
  window.addEventListener('hashchange', route);
  route();
})();
