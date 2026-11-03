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
    ['#/', 'Overview'], ['#/timeline', 'Timeline'], ['#/places', 'Places'], ['#/people', 'People and groups'],
    ['#/lives', 'Real lives'], ['#/know', 'Did you know'], ['#/sources', 'Sources']
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
      '#/people': 'Real people, groups and organisations named in the sources.',
      '#/lives': 'Short accounts of real people from the records.',
      '#/know': 'Facts from the sources that are worth knowing.',
      '#/sources': 'Every source used, and where sources disagree.'
    };
    SECTIONS.slice(1, 7).forEach(function (s) {
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
    else if (r === 'people') viewPeople();
    else if (r === 'lives') viewLives();
    else if (r === 'know') viewKnow();
    else if (r === 'sources') viewSources();
     else if (r === 'discuss') viewDiscuss(); 
    else viewOverview();
  }
  foot.appendChild(p(D.footnote));
  foot.appendChild(p(D.footer));
  window.addEventListener('hashchange', route);
  route();
})();
