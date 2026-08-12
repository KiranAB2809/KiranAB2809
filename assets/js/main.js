(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- security helpers ---------- */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];
  function safeUrl(url) {
    if (!url) return '#';
    var trimmed = String(url).trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      return trimmed; // relative, safe
    }
    try {
      var parsed = new URL(trimmed, window.location.href);
      if (ALLOWED_SCHEMES.indexOf(parsed.protocol) !== -1) return trimmed;
    } catch (e) { /* fallthrough */ }
    return '#';
  }

  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ---------- icons (inline SVG, no external deps) ---------- */
  var ICONS = {
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 20h-3.37v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V20H9.68V8.5h3.24v1.57h.05c.45-.85 1.56-1.75 3.21-1.75 3.43 0 4.06 2.26 4.06 5.2V20Z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v14H4z"/><path d="m4 6 8 7 8-7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.9.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M7 7h.01M7 17h.01"/></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    'git-branch': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.9 7.5.6-5.7 5 1.7 7.3L12 18l-6.4 3.8 1.7-7.3-5.7-5 7.5-.6L12 2Z"/></svg>',
    fork: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M6 8.2V12a4 4 0 0 0 4 4M18 8.2V12a4 4 0 0 0-4 4"/></svg>'
  };

  /* ---------- fetch data ---------- */
  function showJsWarning() {
    var w = document.getElementById('jsWarning');
    if (w) w.classList.add('is-active');
  }

  fetch('data/profile.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      render(data);
    })
    .catch(function (err) {
      console.error('Failed to load profile.json:', err);
      showJsWarning();
    });

  /* ---------- main render ---------- */
  function render(data) {
    window.__profileEmail = data.profile.email;
    renderMeta(data);
    renderNav(data);
    renderHero(data);
    renderStats(data.stats);
    renderAbout(data);
    renderExperience(data.experience);
    renderProjects(data.projects);
    renderSkills(data);
    renderGithub(data.github);
    renderEducationAwards(data);
    renderContact(data);
    renderFooter(data);

    initThemeToggle();
    initMobileMenu();
    initScrollSpyAndProgress();
    initBackToTop();
    initReveal();
    initTilt();
    initFormHandling(data.contact);

    if (new URLSearchParams(window.location.search).get('debugOpenMenu') === '1') {
      setTimeout(function () {
        document.getElementById('mobileMenu').classList.add('is-open');
      }, 200);
    }

    if (new URLSearchParams(window.location.search).get('debugWidth') === '1') {
      setTimeout(function () {
        var dbg = document.createElement('div');
        dbg.style.cssText = 'position:fixed;top:80px;left:0;background:#000;color:#0f0;font-size:14px;z-index:99999;padding:8px;';
        dbg.textContent = 'scrollWidth=' + document.documentElement.scrollWidth + ' innerWidth=' + window.innerWidth + ' bodyScrollW=' + document.body.scrollWidth;
        document.body.appendChild(dbg);
      }, 300);
    }

    // Testing aid: ?debugFlat=1 collapses the hero and forces reveal state
    // so a single tall screenshot can capture the whole page without scrolling.
    if (new URLSearchParams(window.location.search).get('debugFlat') === '1') {
      document.body.classList.add('debug-scroll', 'debug-flat');
      document.querySelectorAll('.skill-bar__fill').forEach(function (bar) { bar.style.width = bar.getAttribute('data-level') + '%'; });
      document.querySelectorAll('.count').forEach(function (c) { c.textContent = c.getAttribute('data-target'); });
      setTimeout(drawRadar, 100);
    }

    // Testing aid: ?debugScrollTo=<sectionId> scrolls after render settles.
    // Harmless in production — only acts when the query param is present.
    var debugTarget = new URLSearchParams(window.location.search).get('debugScrollTo');
    if (debugTarget) {
      document.body.classList.add('debug-scroll'); // testing aid: avoids a headless-screenshot compositing quirk with position:fixed after JS scroll
      setTimeout(function () {
        var t = document.getElementById(debugTarget);
        if (t) t.scrollIntoView({ behavior: 'auto', block: 'start' });
        // force reveal state immediately — IntersectionObserver callbacks
        // don't fire reliably under Chrome's --virtual-time-budget mode.
        document.querySelectorAll('.skill-bar__fill').forEach(function (bar) { bar.style.width = bar.getAttribute('data-level') + '%'; });
        document.querySelectorAll('.count').forEach(function (c) { c.textContent = c.getAttribute('data-target'); });
        drawRadar();
      }, 300);
    }
  }

  function renderMeta(data) {
    document.title = data.meta.title;
    document.getElementById('navBrand').textContent = data.profile.shortName || data.profile.name;
    setAttr('meta[name="description"]', 'content', data.meta.description);
    setAttr('link[rel="canonical"]', 'href', data.meta.siteUrl);
    setAttr('meta[name="theme-color"]', 'content', data.meta.themeColorDark);
    setAttr('meta[property="og:title"]', 'content', data.meta.title);
    setAttr('meta[property="og:description"]', 'content', data.meta.description);
    setAttr('meta[property="og:image"]', 'content', data.meta.siteUrl.replace(/\/$/, '') + '/' + data.meta.ogImage);

    var kw = document.createElement('meta');
    kw.name = 'keywords';
    kw.content = (data.meta.keywords || []).join(', ');
    document.head.appendChild(kw);

    [
      ['property', 'og:url', data.meta.siteUrl],
      ['property', 'og:site_name', data.profile.name],
      ['name', 'twitter:title', data.meta.title],
      ['name', 'twitter:description', data.meta.description],
      ['name', 'twitter:image', data.meta.siteUrl.replace(/\/$/, '') + '/' + data.meta.ogImage]
    ].forEach(function (t) {
      var m = document.createElement('meta');
      m.setAttribute(t[0], t[1]);
      m.setAttribute('content', t[2]);
      document.head.appendChild(m);
    });

    // Person JSON-LD
    var ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.profile.name,
      jobTitle: data.profile.role,
      email: data.profile.email,
      address: data.profile.location,
      url: data.meta.siteUrl,
      sameAs: (data.profile.socials || []).filter(function (s) { return s.url && s.url.indexOf('mailto') === -1 && s.url.indexOf('tel') === -1; }).map(function (s) { return s.url; })
    });
    document.head.appendChild(ld);
  }

  function setAttr(sel, attr, val) {
    var n = document.querySelector(sel);
    if (n && val) n.setAttribute(attr, val);
  }

  function renderNav(data) {
    // links already static in HTML; nothing dynamic needed beyond brand (done in meta).
  }

  function socialIconRow(socials, size) {
    var wrap = document.createElement('div');
    wrap.style.display = 'contents';
    (socials || []).forEach(function (s) {
      var a = document.createElement('a');
      a.href = safeUrl(s.url);
      a.className = 'social-btn';
      a.setAttribute('aria-label', s.label);
      if (safeUrl(s.url).match(/^https?:/)) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      a.innerHTML = ICONS[s.icon] || ICONS.mail;
      wrap.appendChild(a);
    });
    return wrap;
  }

  function renderHero(data) {
    var p = data.profile;
    document.getElementById('heroAvailability').textContent = p.availability || 'Available';
    document.getElementById('heroName').textContent = p.name;
    document.getElementById('heroTagline').textContent = p.tagline;
    document.getElementById('heroResumeLink').href = 'resume.html';
    document.getElementById('heroSocials').appendChild(socialIconRow(p.socials));

    var avatarImg = document.getElementById('avatarImg');
    var card = document.getElementById('portraitCard');
    avatarImg.alt = p.name + ' — portrait';
    avatarImg.onerror = function () {
      card.innerHTML = '<div class="monogram">' + escapeHtml(p.initials || '') + '</div>';
    };
    avatarImg.src = p.avatar;

    document.getElementById('portraitCard').insertAdjacentHTML('beforeend',
      '<div class="portrait-card__caption">' + escapeHtml(p.role) + ' · ' + escapeHtml(p.location) + '</div>');

    // typing effect
    var typedEl = document.getElementById('heroTypedRole');
    typeRoles(typedEl, p.roles && p.roles.length ? p.roles : [p.role]);
  }

  function typeRoles(node, roles) {
    if (prefersReducedMotion) {
      node.textContent = roles[0];
      return;
    }
    var roleIdx = 0, charIdx = 0, deleting = false;
    var TYPE_SPEED = 55, DELETE_SPEED = 30, HOLD = 1400, GAP = 400;

    function tick() {
      var word = roles[roleIdx];
      if (!deleting) {
        charIdx++;
        node.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          setTimeout(tick, HOLD);
          return;
        }
        setTimeout(tick, TYPE_SPEED);
      } else {
        charIdx--;
        node.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
          setTimeout(tick, GAP);
          return;
        }
        setTimeout(tick, DELETE_SPEED);
      }
    }
    tick();
  }

  function renderStats(stats) {
    var grid = document.getElementById('statsGrid');
    (stats || []).forEach(function (s) {
      var card = el('<div class="card stat-card reveal"><div class="stat-card__value"><span class="count" data-target="' + s.value + '">0</span>' + escapeHtml(s.suffix || '') + '</div><div class="stat-card__label">' + escapeHtml(s.label) + '</div></div>');
      grid.appendChild(card);
    });
  }

  function renderAbout(data) {
    var list = document.getElementById('summaryList');
    (data.profile.summary || []).forEach(function (line) {
      list.appendChild(el('<li>' + escapeHtml(line) + '</li>'));
    });

    var other = document.getElementById('otherSkills');
    (data.otherSkills || []).forEach(function (o) {
      other.appendChild(el('<div class="card other-skill reveal"><h4>' + escapeHtml(o.name) + '</h4><p>' + escapeHtml(o.detail) + '</p></div>'));
    });

    var dl = document.getElementById('detailList');
    var per = data.personal || {};
    var rows = [
      ['Location', data.profile.location],
      ['Experience', (data.stats && data.stats[0]) ? (data.stats[0].value + data.stats[0].suffix + ' years') : ''],
      ['Email', data.profile.email],
      ['Phone', data.profile.phone],
      ['Nationality', per.nationality],
      ['Languages', (per.languages || []).join(', ')]
    ];
    rows.forEach(function (r) {
      if (!r[1]) return;
      dl.appendChild(el('<dt>' + escapeHtml(r[0]) + '</dt>'));
      dl.appendChild(el('<dd>' + escapeHtml(r[1]) + '</dd>'));
    });

    var chips = document.getElementById('interestChips');
    (per.interests || []).forEach(function (i) {
      chips.appendChild(el('<span class="chip">' + escapeHtml(i) + '</span>'));
    });
  }

  function renderExperience(experience) {
    var tl = document.getElementById('timeline');
    (experience || []).forEach(function (job) {
      var item = document.createElement('div');
      item.className = 'timeline-item reveal';
      var achieveHtml = (job.achievements && job.achievements.length)
        ? '<div class="tl-achieve"><h5>KEY ACHIEVEMENTS</h5><ul>' + job.achievements.map(function (a) { return '<li>' + escapeHtml(a) + '</li>'; }).join('') + '</ul></div>'
        : '';
      item.innerHTML =
        '<div class="timeline-item__dot' + (job.current ? ' is-current' : '') + '"></div>' +
        '<div class="card tl-card">' +
          '<div class="tl-head">' +
            '<div><div class="tl-role">' + escapeHtml(job.role) + '</div><div class="tl-company">' + escapeHtml(job.company) + '</div></div>' +
            '<div class="tl-meta">' + escapeHtml(job.period) + '<br>' + escapeHtml(job.duration) + ' · ' + escapeHtml(job.location) + '</div>' +
          '</div>' +
          '<p class="tl-summary">' + escapeHtml(job.summary) + '</p>' +
          '<ul class="tl-list">' + (job.highlights || []).map(function (h) { return '<li>' + escapeHtml(h) + '</li>'; }).join('') + '</ul>' +
          achieveHtml +
          '<div class="tl-tech">' + (job.tech || []).map(function (t) { return '<span class="chip">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
        '</div>';
      tl.appendChild(item);
    });
  }

  function renderProjects(projects) {
    var grid = document.getElementById('projectGrid');
    (projects || []).forEach(function (proj) {
      var card = document.createElement('div');
      card.className = 'card project-card reveal' + (proj.featured ? ' is-featured' : '');
      var links = (proj.links || []).map(function (l) {
        var u = safeUrl(l.url);
        return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(l.label) + ' ↗</a>';
      }).join('');
      card.innerHTML =
        '<div class="project-card__top">' +
          '<div><div class="project-card__name">' + escapeHtml(proj.name) + (proj.featured ? ' <span class="chip" style="margin-left:6px;">Featured</span>' : '') + '</div><div class="project-card__org">' + escapeHtml(proj.org) + '</div></div>' +
          '<div class="project-card__period">' + escapeHtml(proj.period) + '</div>' +
        '</div>' +
        '<p class="project-card__overview">' + escapeHtml(proj.overview) + '</p>' +
        '<div class="project-card__tech">' + (proj.tech || []).map(function (t) { return '<span class="chip">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
        (proj.responsibilities && proj.responsibilities.length ?
          '<details><summary>Responsibilities</summary><ul>' + proj.responsibilities.map(function (r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') + '</ul></details>' : '') +
        (proj.impact ? '<div class="project-card__impact"><strong>Impact — </strong>' + escapeHtml(proj.impact) + '</div>' : '') +
        (links ? '<div class="project-card__links">' + links + '</div>' : '');
      grid.appendChild(card);
    });
  }

  function renderSkills(data) {
    var grid = document.getElementById('skillsGrid');
    (data.skillGroups || []).forEach(function (g) {
      var group = document.createElement('div');
      group.className = 'card skill-group reveal';
      var rowsHtml = (g.skills || []).map(function (s) {
        return '<div class="skill-row"><div class="skill-row__top"><span>' + escapeHtml(s.name) + '</span><span>' + s.level + '%</span></div><div class="skill-bar"><div class="skill-bar__fill" data-level="' + s.level + '"></div></div></div>';
      }).join('');
      group.innerHTML = '<h3>' + (ICONS[g.icon] ? '<span style="width:18px;height:18px;display:inline-flex;color:var(--grad-2);">' + ICONS[g.icon] + '</span>' : '') + escapeHtml(g.name) + '</h3>' + rowsHtml;
      grid.appendChild(group);
    });

    var cloud = document.getElementById('tagCloud');
    (data.skillTags || []).forEach(function (t) {
      cloud.appendChild(el('<span class="chip">' + escapeHtml(t) + '</span>'));
    });

    window.__radarData = (data.skillGroups || []).map(function (g) {
      var avg = g.skills.reduce(function (a, s) { return a + s.level; }, 0) / g.skills.length;
      return { label: g.name, value: Math.round(avg) };
    });
    drawRadar();
  }

  /* ---------- radar chart (canvas, no library) ---------- */
  function drawRadar() {
    var canvas = document.getElementById('radarCanvas');
    if (!canvas || !window.__radarData || !window.__radarData.length) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2 - 6;
    var padding = 72; // reserve room for labels so they never clip
    var radius = Math.min(cx, cy) - padding + 30;
    var data = window.__radarData;
    var n = data.length;
    var styles = getComputedStyle(document.documentElement);
    var gridColor = styles.getPropertyValue('--border').trim() || 'rgba(255,255,255,.12)';
    var textColor = styles.getPropertyValue('--text-1').trim() || '#ccc';
    var accent = styles.getPropertyValue('--grad-2').trim() || '#ec4899';
    var accent2 = styles.getPropertyValue('--grad-1').trim() || '#7c3aed';

    var rings = 4;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (var r = 1; r <= rings; r++) {
      var rr = (radius / rings) * r;
      ctx.beginPath();
      for (var i = 0; i <= n; i++) {
        var ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        var x = cx + rr * Math.cos(ang);
        var y = cy + rr * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // spokes + labels
    ctx.fillStyle = textColor;
    ctx.font = '600 12px ' + (getComputedStyle(document.body).fontFamily || 'sans-serif');
    for (i = 0; i < n; i++) {
      ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      var ex = cx + radius * Math.cos(ang);
      var ey = cy + radius * Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = gridColor;
      ctx.stroke();

      var labelR = radius + 26;
      var lx = cx + labelR * Math.cos(ang);
      var ly = cy + labelR * Math.sin(ang);
      var label = data[i].label;
      if (label.length > 16) label = label.slice(0, 15) + '…';
      ctx.textAlign = Math.cos(ang) > 0.3 ? 'left' : (Math.cos(ang) < -0.3 ? 'right' : 'center');
      ctx.textBaseline = Math.sin(ang) > 0.3 ? 'top' : (Math.sin(ang) < -0.3 ? 'bottom' : 'middle');
      ctx.fillText(label, lx, ly);
    }

    // data polygon
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, accent2);
    grad.addColorStop(1, accent);
    ctx.beginPath();
    for (i = 0; i <= n; i++) {
      var idx = i % n;
      ang = (Math.PI * 2 * idx) / n - Math.PI / 2;
      var val = data[idx].value / 100;
      x = cx + radius * val * Math.cos(ang);
      y = cy + radius * val * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.28;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    for (i = 0; i < n; i++) {
      ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      val = data[i].value / 100;
      x = cx + radius * val * Math.cos(ang);
      y = cy + radius * val * Math.sin(ang);
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    }
  }

  /* ---------- github repos ---------- */
  function renderGithub(gh) {
    var grid = document.getElementById('repoGrid');
    if (!gh || !gh.enabled || !gh.username) {
      document.getElementById('github').style.display = 'none';
      return;
    }
    for (var i = 0; i < (gh.maxRepos || 6); i++) {
      grid.appendChild(el('<div class="skeleton"></div>'));
    }

    fetch('https://api.github.com/users/' + encodeURIComponent(gh.username) + '/repos?per_page=100')
      .then(function (r) {
        if (!r.ok) throw new Error('GitHub API ' + r.status);
        return r.json();
      })
      .then(function (repos) {
        if (gh.excludeForks) repos = repos.filter(function (r) { return !r.fork; });
        var pinned = gh.pinned || [];
        repos.sort(function (a, b) {
          var pa = pinned.indexOf(a.name), pb = pinned.indexOf(b.name);
          if (pa !== -1 || pb !== -1) {
            if (pa === -1) return 1;
            if (pb === -1) return -1;
            return pa - pb;
          }
          if (b.stargazers_count !== a.stargazers_count) return b.stargazers_count - a.stargazers_count;
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        repos = repos.slice(0, gh.maxRepos || 6);
        grid.innerHTML = '';
        if (!repos.length) {
          renderGithubFallback(gh, grid, 'No public repositories found.');
          return;
        }
        repos.forEach(function (repo) {
          var card = document.createElement('a');
          card.href = safeUrl(repo.html_url);
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
          card.className = 'card repo-card reveal is-visible';
          card.innerHTML =
            '<div class="repo-card__name">' + escapeHtml(repo.name) + '</div>' +
            '<div class="repo-card__desc">' + escapeHtml(repo.description || 'No description provided.') + '</div>' +
            '<div class="repo-card__meta"><span>★ ' + repo.stargazers_count + '</span><span>' + escapeHtml(repo.language || '—') + '</span></div>';
          grid.appendChild(card);
        });
      })
      .catch(function (err) {
        console.warn('GitHub fetch failed (likely rate-limited or offline):', err);
        grid.innerHTML = '';
        renderGithubFallback(gh, grid);
      });
  }

  function renderGithubFallback(gh, grid, message) {
    grid.appendChild(el(
      '<div class="github-fallback" style="grid-column:1/-1;">' +
        '<p>' + escapeHtml(message || "GitHub repos couldn't be loaded right now (rate limit or offline).") + '</p>' +
        '<a class="btn btn--ghost" style="margin-top:16px;" href="' + safeUrl('https://github.com/' + gh.username) + '" target="_blank" rel="noopener noreferrer">Browse on GitHub ↗</a>' +
      '</div>'
    ));
  }

  function renderEducationAwards(data) {
    var edu = document.getElementById('educationList');
    edu.appendChild(el('<h3 style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-2);margin-bottom:12px;">EDUCATION</h3>'));
    (data.education || []).forEach(function (e) {
      edu.appendChild(el(
        '<div class="ea-item"><h4>' + escapeHtml(e.degree) + (e.field ? ' — ' + escapeHtml(e.field) : '') + '</h4>' +
        '<p>' + escapeHtml(e.institution) + '</p>' +
        '<p><span class="ea-year">' + escapeHtml(e.year) + '</span> · ' + escapeHtml(e.performance) + '</p></div>'
      ));
    });

    var awards = document.getElementById('awardsList');
    awards.appendChild(el('<h3 style="font-family:var(--font-mono);font-size:.85rem;color:var(--text-2);margin-bottom:12px;">AWARDS</h3>'));
    (data.awards || []).forEach(function (a) {
      awards.appendChild(el(
        '<div class="ea-item"><h4>' + escapeHtml(a.title) + '</h4>' +
        '<p>' + escapeHtml(a.org) + (a.note ? ' — ' + escapeHtml(a.note) : '') + '</p>' +
        '<p><span class="ea-year">' + escapeHtml(a.year) + '</span></p></div>'
      ));
    });
  }

  function renderContact(data) {
    var c = data.contact || {};
    document.getElementById('contactHeading').textContent = c.heading || 'Contact';
    document.getElementById('contactBlurb').textContent = c.blurb || '';

    var list = document.getElementById('contactList');
    var p = data.profile;
    var rows = [
      { icon: 'mail', label: p.email, url: 'mailto:' + p.email },
      { icon: 'linkedin', label: 'LinkedIn Profile', url: p.socials.find(function (s) { return s.icon === 'linkedin'; }).url },
      { icon: 'github', label: 'GitHub Profile', url: p.socials.find(function (s) { return s.icon === 'github'; }).url }
    ];
    if (c.showPhone) rows.splice(1, 0, { icon: 'phone', label: p.phone, url: 'tel:' + p.phone.replace(/\s+/g, '') });

    rows.forEach(function (r) {
      var u = safeUrl(r.url);
      var a = document.createElement('a');
      a.href = u;
      if (u.match(/^https?:/)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.innerHTML = (ICONS[r.icon] || '') + '<span>' + escapeHtml(r.label) + '</span>';
      list.appendChild(a);
    });
  }

  function renderFooter(data) {
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    document.getElementById('footerText').innerHTML = '© <span id="footerYear2">' + new Date().getFullYear() + '</span> ' + escapeHtml(data.profile.name) + '. All rights reserved.';
    document.getElementById('footerSocials').appendChild(socialIconRow(data.profile.socials));
  }

  /* ---------- interactions ---------- */
  function initThemeToggle() {
    var btn = document.getElementById('themeToggle');
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      drawRadar(); // re-render so grid/label colours stay legible
    });
  }

  function initMobileMenu() {
    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  function initScrollSpyAndProgress() {
    var nav = document.getElementById('nav');
    var progress = document.getElementById('scrollProgress');
    var navLinks = document.querySelectorAll('.nav__links a, .mobile-menu a');
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

    navLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var targetId = a.getAttribute('href');
        if (!targetId || targetId.charAt(0) !== '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', targetId);
      });
    });

    function onScroll() {
      var scrollTop = window.scrollY;
      nav.classList.toggle('is-scrolled', scrollTop > 20);

      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) + '%' : '0%';

      var current = null;
      sections.forEach(function (s) {
        var rect = s.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) current = s.id;
      });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
      });
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    document.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  function animateCount(node) {
    var target = parseInt(node.getAttribute('data-target'), 10) || 0;
    if (prefersReducedMotion) { node.textContent = target; return; }
    var start = 0;
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min(1, (ts - startTime) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
      else node.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function initReveal() {
    var revealEls = document.querySelectorAll('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (elx) { elx.classList.add('is-visible'); });
      document.querySelectorAll('.skill-bar__fill').forEach(function (bar) {
        bar.style.width = bar.getAttribute('data-level') + '%';
      });
      document.querySelectorAll('.count').forEach(function (c) { c.textContent = c.getAttribute('data-target'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var target = entry.target;
          setTimeout(function () {
            target.classList.add('is-visible');
            var bars = target.querySelectorAll('.skill-bar__fill');
            bars.forEach(function (bar) { bar.style.width = bar.getAttribute('data-level') + '%'; });
            var counts = target.querySelectorAll('.count');
            counts.forEach(animateCount);
          }, (i % 6) * 70);
          io.unobserve(target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (elx) { io.observe(elx); });
  }

  function initTilt() {
    if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    var card = document.getElementById('portraitCard');
    if (!card) return;
    var bounds;
    card.addEventListener('mouseenter', function () { bounds = card.getBoundingClientRect(); });
    card.addEventListener('mousemove', function (e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      var px = (e.clientX - bounds.left) / bounds.width - 0.5;
      var py = (e.clientY - bounds.top) / bounds.height - 0.5;
      card.style.transform = 'rotateY(' + (px * 10) + 'deg) rotateX(' + (-py * 10) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'rotateY(0) rotateX(0)';
    });
  }

  function initFormHandling(contact) {
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var honeypot = form._gotcha.value;

      if (honeypot) { return; } // silently drop bot submissions

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name || !emailOk || !message) {
        status.textContent = 'Please fill in your name, a valid email, and a message.';
        status.classList.add('err');
        return;
      }

      var endpoint = contact && contact.formspreeEndpoint;
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (r) {
          if (r.ok) {
            status.textContent = 'Thanks — your message was sent!';
            status.classList.add('ok');
            form.reset();
          } else {
            throw new Error('Formspree error');
          }
        }).catch(function () {
          status.textContent = "Couldn't send automatically — opening your email client instead.";
          status.classList.add('err');
          openMailto(name, email, message);
        });
      } else {
        // No Formspree endpoint configured: fall back to mailto so the form is never broken.
        status.textContent = 'Opening your email client to send this message…';
        status.classList.add('ok');
        openMailto(name, email, message);
      }
    });

    function openMailto(name, email, message) {
      var to = (window.__profileEmail || '');
      var subject = encodeURIComponent('Portfolio contact from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    }
  }

})();
