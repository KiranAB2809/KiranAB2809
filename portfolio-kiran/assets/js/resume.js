(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  fetch('data/profile.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      console.error('Failed to load profile.json:', err);
      document.getElementById('sheet').innerHTML =
        '<p style="padding:40px;font-family:sans-serif;">Couldn\'t load resume data. ' +
        'If you opened this file directly, please run <code>npm start</code> and open ' +
        '<code>http://127.0.0.1:5173/resume.html</code> instead.</p>';
    });

  function render(data) {
    var p = data.profile;
    var opts = data.resumeOptions || {};

    document.title = p.name + ' — Resume';
    document.getElementById('rName').textContent = p.name;
    document.getElementById('rRole').textContent = p.role;

    var contacts = [p.location, p.phone, p.email];
    if (p.socials) {
      p.socials.forEach(function (s) {
        if (s.icon === 'linkedin' || s.icon === 'github') contacts.push(s.url.replace(/^https?:\/\//, ''));
      });
    }
    document.getElementById('rContacts').innerHTML = contacts.filter(Boolean).map(function (c) {
      return '<span>' + escapeHtml(c) + '</span>';
    }).join('');

    var sumList = document.getElementById('rSummary');
    (p.summary || []).forEach(function (s) {
      sumList.appendChild(li(s));
    });

    var skillsGrid = document.getElementById('rSkills');
    (data.skillGroups || []).forEach(function (g) {
      var div = document.createElement('div');
      div.innerHTML = '<b>' + escapeHtml(g.name) + ':</b> ' + g.skills.map(function (s) { return escapeHtml(s.name); }).join(', ');
      skillsGrid.appendChild(div);
    });

    var expWrap = document.getElementById('rExperience');
    (data.experience || []).forEach(function (job) {
      var bullets = (job.highlights || []).concat(job.achievements || []);
      expWrap.appendChild(entry({
        left: job.role,
        right: job.period,
        subLeft: job.company,
        subRight: job.location,
        desc: job.summary,
        bullets: bullets,
        tech: job.tech
      }));
    });

    var projWrap = document.getElementById('rProjects');
    (data.projects || []).forEach(function (proj) {
      var bullets = (proj.responsibilities || []).slice();
      if (proj.impact) bullets.push('Impact: ' + proj.impact);
      projWrap.appendChild(entry({
        left: proj.name,
        right: proj.period,
        subLeft: proj.org,
        subRight: '',
        desc: proj.overview,
        bullets: bullets,
        tech: proj.tech
      }));
    });

    if (opts.includeEducation !== false) {
      var eduWrap = document.getElementById('rEducation');
      (data.education || []).forEach(function (e) {
        var row = document.createElement('div');
        row.className = 'r-edu-item';
        row.innerHTML =
          '<div class="r-e-left"><b>' + escapeHtml(e.degree) + (e.field ? ' — ' + escapeHtml(e.field) : '') + '</b>' +
          '<div>' + escapeHtml(e.institution) + '</div></div>' +
          '<div class="r-e-right">' + escapeHtml(e.year) + '<br>' + escapeHtml(e.performance) + '</div>';
        eduWrap.appendChild(row);
      });
    } else {
      document.getElementById('rEducationSection').remove();
    }

    if (opts.includeAwards !== false && data.awards && data.awards.length) {
      var awWrap = document.getElementById('rAwards');
      data.awards.forEach(function (a) {
        var row = document.createElement('div');
        row.className = 'r-award-item';
        row.innerHTML =
          '<div class="r-e-left"><b>' + escapeHtml(a.title) + '</b>' +
          '<div>' + escapeHtml(a.org) + (a.note ? ' — ' + escapeHtml(a.note) : '') + '</div></div>' +
          '<div class="r-e-right">' + escapeHtml(a.year) + '</div>';
        awWrap.appendChild(row);
      });
    } else {
      var awSec = document.getElementById('rAwardsSection');
      if (awSec) awSec.remove();
    }

    if (opts.includePersonalDetails !== false && data.personal) {
      var per = data.personal;
      var pWrap = document.getElementById('rPersonal');
      var rows = [
        ['Date of Birth', per.dateOfBirth],
        ['Nationality', per.nationality],
        ['Location', per.location],
        ['Languages', (per.languages || []).join(', ')],
        ['Interests', (per.interests || []).join(', ')]
      ];
      rows.forEach(function (r) {
        if (!r[1]) return;
        var d = document.createElement('div');
        d.innerHTML = '<b>' + escapeHtml(r[0]) + ':</b> ' + escapeHtml(r[1]);
        pWrap.appendChild(d);
      });
    } else {
      var pSec = document.getElementById('rPersonalSection');
      if (pSec) pSec.remove();
    }

    if (opts.footerNote) {
      document.getElementById('rFooter').textContent = opts.footerNote;
    }

    document.getElementById('downloadBtn').href = p.resumeFile;

    document.getElementById('printBtn').addEventListener('click', function () {
      window.print();
    });

    if (new URLSearchParams(window.location.search).get('print') === '1') {
      setTimeout(function () { window.print(); }, 300);
    }

    // Signal to the PDF generator that rendering is complete.
    window.__RESUME_READY__ = true;
  }

  function li(text) {
    var n = document.createElement('li');
    n.textContent = text;
    return n;
  }

  function entry(opts) {
    var wrap = document.createElement('div');
    wrap.className = 'r-entry';
    var bulletsHtml = (opts.bullets || []).map(function (b) { return '<li>' + escapeHtml(b) + '</li>'; }).join('');
    var techHtml = opts.tech && opts.tech.length ? '<div class="r-tech"><b>Tech:</b> ' + opts.tech.map(escapeHtml).join(', ') + '</div>' : '';
    wrap.innerHTML =
      '<div class="r-entry__top"><span>' + escapeHtml(opts.left) + '</span><span>' + escapeHtml(opts.right) + '</span></div>' +
      (opts.subLeft ? '<div class="r-entry__sub"><span>' + escapeHtml(opts.subLeft) + '</span><span>' + escapeHtml(opts.subRight || '') + '</span></div>' : '') +
      (opts.desc ? '<p class="desc">' + escapeHtml(opts.desc) + '</p>' : '') +
      (bulletsHtml ? '<ul>' + bulletsHtml + '</ul>' : '') +
      techHtml;
    return wrap;
  }
})();
