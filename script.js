(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  // Lifecycle stages as tabs
  var list = document.querySelector('.lifecycle');
  if (list) {
    var stages = Array.prototype.slice.call(list.children);
    var bar = document.createElement('div');
    bar.className = 'stage-tabs';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Maintenance lifecycle stages');
    var tabs = stages.map(function (li, i) {
      var h = li.querySelector('h3');
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'tab-' + li.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', li.id);
      b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + h.textContent;
      li.setAttribute('role', 'tabpanel');
      li.setAttribute('aria-labelledby', b.id);
      li.setAttribute('tabindex', '0');
      b.addEventListener('click', function () { select(i, false); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
      bar.appendChild(b);
      return b;
    });
    list.parentNode.insertBefore(bar, list);
    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        stages[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    select(0, false);
  }

  // Counter-plan illustration
  var sim = document.querySelector('.sim');
  if (sim) {
    sim.hidden = false;
    var MILES = 5000, MONTHS = 6;
    var mi = document.getElementById('sim-miles');
    var mo = document.getElementById('sim-months');
    var out = document.getElementById('sim-out');
    function update() {
      var m = +mi.value, t = +mo.value;
      document.getElementById('sim-miles-val').textContent = m.toLocaleString('en-US');
      document.getElementById('sim-months-val').textContent = t;
      var pm = Math.min(m / MILES, 1), pt = Math.min(t / MONTHS, 1);
      var bm = document.getElementById('sim-miles-bar'), bt = document.getElementById('sim-months-bar');
      bm.style.width = (pm * 100) + '%';
      bt.style.width = (pt * 100) + '%';
      bm.classList.toggle('hit', m >= MILES);
      bt.classList.toggle('hit', t >= MONTHS);
      var dm = m >= MILES, dt = t >= MONTHS;
      out.className = dm || dt ? 'due' : '';
      out.textContent = dm && dt ? 'Due: both limits reached'
        : dm ? 'Due: mileage limit reached first'
        : dt ? 'Due: time limit reached first'
        : 'Not due yet (' + Math.round(Math.max(pm, pt) * 100) + '% of the nearest limit)';
    }
    mi.addEventListener('input', update);
    mo.addEventListener('input', update);
    Array.prototype.forEach.call(sim.querySelectorAll('.presets button'), function (b) {
      b.addEventListener('click', function () {
        mi.value = b.getAttribute('data-miles');
        mo.value = b.getAttribute('data-months');
        update();
      });
    });
    update();
  }

  // Skill-area filter
  var filter = document.querySelector('.filter');
  if (filter) {
    filter.hidden = false;
    var items = document.querySelectorAll('#work [data-tags], #experience [data-tags]');
    var status = filter.querySelector('.filter-status');
    var buttons = filter.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        var active = b.getAttribute('aria-pressed') !== 'true';
        Array.prototype.forEach.call(buttons, function (o) { o.setAttribute('aria-pressed', 'false'); });
        var tag = active ? b.getAttribute('data-tag') : null;
        if (active) b.setAttribute('aria-pressed', 'true');
        var count = 0;
        Array.prototype.forEach.call(items, function (el) {
          var match = !tag || (' ' + el.getAttribute('data-tags') + ' ').indexOf(' ' + tag + ' ') > -1;
          el.classList.toggle('dim', !match);
          if (tag && match) count++;
        });
        status.textContent = tag ? 'Highlighting ' + count + ' items for ' + b.textContent + '. Select it again to clear.' : '';
      });
    });
  }

  // Earlier roles
  var toggle = document.querySelector('.early-toggle');
  var early = document.querySelectorAll('.timeline .early');
  if (toggle && early.length) {
    toggle.hidden = false;
    var setEarly = function (show) {
      Array.prototype.forEach.call(early, function (el) { el.hidden = !show; });
      toggle.setAttribute('aria-expanded', show ? 'true' : 'false');
      toggle.textContent = show ? 'Hide earlier roles' : 'Show earlier roles (' + early.length + ')';
    };
    toggle.addEventListener('click', function () { setEarly(toggle.getAttribute('aria-expanded') !== 'true'); });
    setEarly(false);
  }

  // Current section in the nav
  var links = document.querySelectorAll('.topnav a');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    Array.prototype.forEach.call(links, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          Array.prototype.forEach.call(links, function (a) { a.removeAttribute('aria-current'); });
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
