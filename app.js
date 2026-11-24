// The online portal's main page: builds, team, downloads and account, drawn here from what the server sends.
// Each page is a renderer in PS.app.pages, so code the server sends for some accounts can add pages or replace one.
// The frame around them: a dark sidebar with the pages, a top bar with search and the account, the page under it.
(function () {
  "use strict";
  var PS = window.PS, esc = PS.esc, when = PS.when, mb = PS.mb;
  var root = document.getElementById("app");
  var params = new URLSearchParams(location.search);

  var app = PS.app = { pages: {}, order: ["builds", "insights", "convert", "team", "downloads", "account"], current: "", main: null, banner: "" };
  var extended = new Promise(function (r) { app.extended = r; });

  // line icons for the sidebar; a page can bring its own as `icon` (the paths inside a 24×24 box)
  var ICONS = {
    builds: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    insights: '<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>',
    convert: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
    team: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.7-3.3 3-5 6-5s5.3 1.7 6 5M16 4.8a3.2 3.2 0 0 1 0 6.3M18 14.6c1.6.7 2.6 2.3 3 4.9"/>',
    downloads: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
    account: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8"/>',
  };
  var SEARCH = '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>';
  app.icon = function (paths) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (paths || '<circle cx="12" cy="12" r="3"/>') + "</svg>"; };
  var icon = app.icon;
  var slim = false;
  try { slim = localStorage.getItem("playspell:slim") === "1"; } catch (e) { /* storage off: the wide sidebar */ }

  function frame() {
    var me = PS.me, nav = app.order.filter(function (k) { var p = app.pages[k]; return p && (!p.show || p.show(me)); });
    root.innerHTML = '<div class="shell' + (slim ? " slim" : "") + '"><aside class="side"><a class="brand" href="#builds"><span class="mark">✦</span><span>PlaySpell</span></a>' +
      '<nav aria-label="Pages">' + nav.map(function (k) {
        var p = app.pages[k];
        return '<a href="#' + k + '"' + (k === app.current ? ' class="on" aria-current="page"' : "") + ' title="' + esc(p.title) + '">' + icon(p.icon || ICONS[k]) + "<span>" + esc(p.title) + "</span></a>";
      }).join("") + '</nav><div class="side-foot"><span>PlaySpell portal</span><button id="slim" aria-label="' + (slim ? "Widen" : "Narrow") + ' the sidebar" title="' + (slim ? "Widen" : "Narrow") + ' the sidebar">' + icon('<path d="M14.5 6l-6 6 6 6"/>') + "</button></div></aside>" +
      '<div class="page"><header class="topbar"><div class="find" role="search">' + icon(SEARCH) +
      '<input id="globalFind" type="search" placeholder="Search projects and concepts" aria-label="Search projects and concepts" autocomplete="off"><div class="find-pop" hidden></div></div>' +
      '<span class="who">' + (me.team ? '<span class="team">' + esc(me.team) + "</span>" : "") + '<b title="' + esc(me.email) + '">' + esc(me.name || me.email) + '</b><button id="signOut" class="ghost">Sign out</button></span></header>' +
      (app.banner ? '<p class="err banner">' + app.banner + "</p>" : "") + "<main></main></div></div>";
    app.main = root.querySelector("main");
    if (app.pages[app.current] && app.pages[app.current].wide) app.main.className = "wide";
    root.querySelector("#signOut").onclick = function () { PS.signOut(); location.hash = ""; start(); };
    root.querySelector("#slim").onclick = function () {
      slim = !slim;
      try { localStorage.setItem("playspell:slim", slim ? "1" : "0"); } catch (e) { /* this visit only */ }
      frame.keep();
    };
    wireFind(root.querySelector(".find"));
  }
  // redraws the frame around the page that's showing, keeping the page
  frame.keep = function () {
    var page = app.main;
    frame();
    app.main.replaceWith(page);
    app.main = page;
  };

  // a page and what follows "?" in its address, for the page to read (#insights?project=Fishing)
  app.params = new URLSearchParams();
  app.visits = 0;
  app.go = function (name) {
    var q = String(name || "").split("?");
    name = q[0];
    app.params = new URLSearchParams(q.slice(1).join("?"));
    app.visits++;
    if (!app.pages[name] || (app.pages[name].show && !app.pages[name].show(PS.me))) name = "builds";
    app.current = name;
    frame();
    var main = app.main;
    main.innerHTML = '<p class="dim">Loading…</p>';
    Promise.resolve().then(function () { return app.pages[name].render(main); }).catch(function (e) { main.innerHTML = '<div class="card"><p class="err">' + esc(e.message) + "</p></div>"; });
  };
  app.refresh = function () { app.go(location.hash.slice(1) || app.current || "builds"); };
  // a form's fields as an object; the button shows it's working, and the error shows under the form
  app.form = function (form, run) {
    form.onsubmit = function (ev) {
      ev.preventDefault();
      var data = {}, btn = ev.submitter || form.querySelector("button");
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var errBox = form.querySelector(".err") || form.appendChild(Object.assign(document.createElement("p"), { className: "err" }));
      errBox.textContent = "";
      if (btn) btn.disabled = true;
      Promise.resolve(run(data, btn)).catch(function (e) { errBox.textContent = e.message; }).finally(function () { if (btn) btn.disabled = false; });
    };
  };

  // ---------------------------------------------------------------- pieces the lists share

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var two = function (n) { return (n < 10 ? "0" : "") + n; };
  // "13 November, 18:15" in the viewer's time, with the year when it isn't this one; the exact UTC time on hover.
  // Phones show the short form, "13 Nov".
  app.day = function (t) {
    if (!t) return "";
    var d = new Date(t), other = d.getFullYear() !== new Date().getFullYear(), month = MONTHS[d.getMonth()];
    return '<span title="' + esc(when(t)) + '"><span class="long">' + d.getDate() + " " + month + (other ? " " + d.getFullYear() : "") + ", " + two(d.getHours()) + ":" + two(d.getMinutes()) +
      '</span><span class="short">' + d.getDate() + " " + month.slice(0, 3) + (other ? " " + String(d.getFullYear()).slice(2) : "") + "</span></span>";
  };
  // a project's square: its first letter on a colour that stays the same for the same name
  var TILE = ["#5468e8", "#d9613a", "#1d9470", "#bf4495", "#a8731b", "#2b86cf", "#7656e6", "#cc4a5a"];
  app.tile = function (name, big) {
    var s = String(name || "").trim(), h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return '<span class="tile' + (big ? " big" : "") + '" style="background:' + TILE[h % TILE.length] + '" aria-hidden="true">' + esc((Array.from(s)[0] || "?").toUpperCase()) + "</span>";
  };
  var same = function (a, b) { return String(a || "").toLowerCase() === String(b || "").toLowerCase(); };
  // builds grouped into projects: a team's project is its own, as the server keeps them
  app.projectsOf = function (r) {
    var map = {}, list = [];
    r.builds.forEach(function (b) {
      var key = (b.team || "") + "\n" + String(b.project || "").toLowerCase(), p = map[key];
      if (!p) list.push(p = map[key] = { name: b.project || "", team: b.team, builds: [], size: 0, updated: 0, by: "" });
      p.builds.push(b);
      p.size += b.size || 0;
      if ((b.publishedAt || 0) > p.updated) { p.updated = b.publishedAt || 0; p.by = b.by; }
    });
    return list;
  };
  app.projectHref = function (p) { return "#builds?project=" + encodeURIComponent(p.name) + (p.team != null ? "&team=" + encodeURIComponent(p.team) : ""); };
  var projectName = function (name) { return name ? esc(name) : '<span class="dim">No project</span>'; };

  // A list in a card: the first column's head filters it, the other heads with a key sort it. Rows the filter hides
  // stay in the page; sorting draws the rows again.
  function list(box, o) {
    var dir = o.sort.dir, key = o.sort.key, q = "";
    var draw = function () {
      var items = o.items.slice().sort(function (a, b) {
        var x = o.value(a, key), y = o.value(b, key);
        if (typeof x === "string") return x.localeCompare(y, undefined, { sensitivity: "base", numeric: true }) * dir;
        return ((x || 0) - (y || 0)) * dir;
      });
      var sortBtn = function (c, label) {
        return '<button class="sort' + (key === c.key ? (dir > 0 ? " up" : " down") : "") + '" data-sort="' + c.key + '"' + (label ? "" : ' aria-label="Sort by ' + esc(c.label.toLowerCase()) + '"') + ">" + (label ? esc(c.label) : "") + "</button>";
      };
      box.innerHTML = '<table class="list"><thead><tr>' + o.cols.map(function (c, i) {
        var head = i === 0 ? '<span class="colfind">' + icon(SEARCH) + '<input type="search" placeholder="' + esc(c.label) + '" aria-label="Filter by ' + esc(c.label.toLowerCase()) + '" value="' + esc(q) + '"></span>' + (c.key ? sortBtn(c, false) : "")
          : c.key ? sortBtn(c, true) : esc(c.label);
        return "<th" + (c.cls ? ' class="' + c.cls + '"' : "") + ">" + head + "</th>";
      }).join("") + "</tr></thead><tbody>" + items.map(function (it) {
        return o.row(it).replace("<tr", '<tr data-find="' + esc(o.text(it).toLowerCase()) + '"');
      }).join("") + '</tbody></table><p class="none dim" hidden>Nothing here matches.</p>';
      var input = box.querySelector(".colfind input"), none = box.querySelector(".none");
      var filter = function () {
        q = input.value;
        var n = 0, s = q.trim().toLowerCase();
        box.querySelectorAll("tbody tr").forEach(function (tr) { var show = !s || tr.dataset.find.includes(s); tr.hidden = !show; if (show) n++; });
        none.hidden = n > 0;
      };
      input.oninput = filter;
      filter();
      box.querySelectorAll("button.sort").forEach(function (b) {
        b.onclick = function () {
          if (key === b.dataset.sort) dir = -dir;
          else { key = b.dataset.sort; dir = key === "name" ? 1 : -1; }
          draw();
          box.querySelector('button.sort[data-sort="' + key + '"]').focus();
        };
      });
      // a row opens where it leads, except clicks on what's inside it that does something itself
      box.querySelectorAll("tbody tr[data-href]").forEach(function (tr) {
        tr.onclick = function (e) { if (!e.target.closest("a,button,select,input,label")) location.href = tr.dataset.href; };
      });
      if (o.drawn) o.drawn(box);
    };
    draw();
  }

  // ---------------------------------------------------------------- the search in the top bar

  var everything = null; // the builds list, for the search box: fetched when it's first used, fresh with every Builds visit
  var allBuilds = function () {
    if (!everything) everything = PS.call("builds", {}, { retry: true }).catch(function (e) { everything = null; throw e; });
    return everything;
  };
  function wireFind(box) {
    var input = box.querySelector("input"), pop = box.querySelector(".find-pop"), timer = 0, asked = 0;
    var close = function () { pop.hidden = true; };
    var show = async function () {
      var s = input.value.trim().toLowerCase(), mine = ++asked;
      if (!s) return close();
      var r;
      try { r = await allBuilds(); } catch (e) { pop.innerHTML = '<p class="none err">' + esc(e.message) + "</p>"; pop.hidden = false; return; }
      if (mine !== asked) return;
      var projects = app.projectsOf(r).filter(function (p) { return p.name.toLowerCase().includes(s); }).slice(0, 5);
      var concepts = r.builds.filter(function (b) { return b.name.toLowerCase().includes(s); }).slice(0, 8);
      pop.innerHTML = (projects.length ? "<h6>Projects</h6>" + projects.map(function (p) {
        return '<a href="' + app.projectHref(p) + '">' + app.tile(p.name) + '<span class="nm">' + projectName(p.name) + '</span><span class="dim">' + p.builds.length + " concept" + (p.builds.length === 1 ? "" : "s") + "</span></a>";
      }).join("") : "") + (concepts.length ? "<h6>Concepts</h6>" + concepts.map(function (b) {
        return '<a href="portal.html?b=' + encodeURIComponent(b.id) + '"><span class="nm">' + esc(b.name) + '</span><span class="dim">' + projectName(b.project) + "</span></a>";
      }).join("") : "") || '<p class="none dim">Nothing matches “' + esc(input.value.trim()) + "”.</p>";
      pop.hidden = false;
    };
    var move = function (step) {
      var links = Array.prototype.slice.call(pop.querySelectorAll("a")), at = links.indexOf(pop.querySelector("a.on"));
      if (!links.length) return;
      if (at >= 0) links[at].classList.remove("on");
      at = (at + step + links.length) % links.length;
      links[at].classList.add("on");
      links[at].scrollIntoView({ block: "nearest" });
    };
    input.oninput = function () { clearTimeout(timer); timer = setTimeout(show, 120); };
    input.onfocus = function () { if (input.value.trim()) show(); };
    input.onkeydown = function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (pop.hidden) show(); else move(e.key === "ArrowDown" ? 1 : -1); }
      else if (e.key === "Enter") { var a = pop.querySelector("a.on") || pop.querySelector("a"); if (a) { e.preventDefault(); location.href = a.getAttribute("href"); } }
      else if (e.key === "Escape") { input.value = ""; close(); }
    };
    pop.onclick = function () { close(); };
    box.addEventListener("focusout", function () { setTimeout(function () { if (!box.contains(document.activeElement)) close(); }, 150); });
  }

  // ---------------------------------------------------------------- builds: the projects, and a project's concepts

  // a concept as one row of a flat list (kept for code the server sends that still draws one)
  app.buildRow = function (b) {
    return '<tr><td><a href="portal.html?b=' + encodeURIComponent(b.id) + '"><b>' + esc(b.name) + "</b></a></td><td>" + esc(b.project) + "</td>" +
      "<td>" + mb(b.size) + "</td><td>" + when(b.publishedAt) + (b.revision > 1 ? ' <span class="dim">· version ' + b.revision + "</span>" : "") + '<br><span class="dim">' + esc(b.by) + "</span></td><td>" + b.shares + "</td>" +
      "<td>" + [b.project ? '<a href="#insights?project=' + encodeURIComponent(b.project) + '" title="How this project\'s concepts do">Insights</a>' : "",
        b.mayChange ? '<button class="link" data-rename="' + esc(b.id) + '">Rename</button> · <button class="link" data-delete="' + esc(b.id) + '">Delete</button>' : ""].filter(Boolean).join(" · ") + "</td></tr>";
  };
  app.wireBuildActions = function (main, builds) {
    var back = location.hash.slice(1) || "builds";
    main.querySelectorAll("[data-rename]").forEach(function (el) { el.onclick = function () { renameBuild(builds.find(function (b) { return b.id === el.dataset.rename; }), false, back); }; });
    main.querySelectorAll("[data-delete]").forEach(function (el) { el.onclick = function () { deleteBuild(builds.find(function (b) { return b.id === el.dataset.delete; }), back); }; });
  };
  // Code the server sends to accounts that run teams sets these: a cell for moving a concept to another team, and
  // what makes its buttons work.
  app.teamCell = null;
  app.wireTeamCells = null;

  var CHART = '<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>', NEXT = '<path d="M9.5 6l6 6-6 6"/>';
  var PENCIL = '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>', BIN = '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>';
  var insightsLink = function (name) {
    return name ? '<a class="icon-btn" href="#insights?project=' + encodeURIComponent(name) + '" title="How this project\'s concepts do" aria-label="Insights for ' + esc(name) + '">' + icon(CHART) + "</a>" : "";
  };

  function projectsPage(main, r) {
    var teams = r.teams || {}, byTeam = Object.keys(teams).length > 1, projects = app.projectsOf(r);
    var teamName = function (id) { return id ? esc((teams[id] || {}).name || "") : '<span class="dim">No team</span>'; };
    main.innerHTML = '<div class="head"><h2>Builds</h2></div>' +
      '<div class="section"><h3>Projects</h3>' + (projects.length ? '<span class="count">' + projects.length + "</span>" : "") + "</div>" +
      '<div class="card list" id="projects">' + (projects.length ? "" : '<p class="empty">' + (r.noTeam
        ? PS.me.admin && PS.me.ui ? "Make a team on the Teams page; the builds you publish go to it, and your teams' builds show here."
          : "You aren't on a team yet. Ask your admin to add you to one, and your team's builds will show here."
        : 'Nothing published yet. Get PlaySpell from <a href="#downloads">Downloads</a>, then press <b>Publish</b> on its Build tab in Unity.') + "</p>") + "</div>";
    if (!projects.length) return;
    list(main.querySelector("#projects"), {
      items: projects,
      cols: [{ label: "Project name", key: "name" }].concat(byTeam ? [{ label: "Team", cls: "wide-only" }] : [],
        [{ label: "Concepts", key: "count" }, { label: "Size", key: "size", cls: "wide-only" }, { label: "Updated", key: "updated" }, { label: "", cls: "acts" }]),
      sort: { key: "updated", dir: -1 },
      value: function (p, k) { return k === "name" ? p.name : k === "count" ? p.builds.length : k === "size" ? p.size : p.updated; },
      text: function (p) { return p.name + " " + (byTeam ? (teams[p.team] || {}).name || "" : ""); },
      row: function (p) {
        var href = app.projectHref(p);
        return '<tr data-href="' + esc(href) + '"><td><div class="name">' + app.tile(p.name) + '<a href="' + esc(href) + '">' + projectName(p.name) + "</a></div></td>" +
          (byTeam ? '<td class="wide-only">' + teamName(p.team) + "</td>" : "") + "<td>" + p.builds.length + '</td><td class="wide-only">' + mb(p.size) + "</td>" +
          "<td>" + app.day(p.updated) + '<div class="dim small">' + esc(p.by) + '</div></td><td class="acts">' + insightsLink(p.name) + '<span class="chev">' + icon(NEXT) + "</span></td></tr>";
      },
    });
  }

  function conceptsPage(main, r, name, team) {
    var teams = r.teams || {}, mine = r.builds.filter(function (b) { return same(b.project, name) && (team == null || (b.team || "") === team); });
    var crumbs = '<nav class="crumbs" aria-label="Where you are"><a href="#builds">Builds</a><span aria-hidden="true">›</span><b>' + projectName(mine.length ? mine[0].project : name) + "</b></nav>";
    if (!mine.length) {
      main.innerHTML = crumbs + '<div class="card"><p>This project has no builds here any more. They may have been deleted or moved to another team.</p><a class="button" href="#builds">All projects</a></div>';
      return;
    }
    // without a team in the address (a build page's way back) it's that name in every team the viewer sees
    var p = { name: mine[0].project || "", size: mine.reduce(function (n, b) { return n + (b.size || 0); }, 0) }, picker = app.teamCell && Object.keys(teams).length > 1;
    var facts = [mine.length + " concept" + (mine.length === 1 ? "" : "s"), mb(p.size)];
    if (team != null && Object.keys(teams).length > 1) facts.unshift(team ? esc((teams[team] || {}).name || "") : "No team");
    main.innerHTML = crumbs + '<div class="proj">' + app.tile(p.name, true) + "<div><h2>" + projectName(p.name) + '</h2><div class="dim">' + facts.join(" · ") + "</div></div>" +
      (p.name ? '<a class="button ghost" href="#insights?project=' + encodeURIComponent(p.name) + '">' + icon(CHART) + "Insights</a>" : "") + "</div>" +
      '<div class="section"><h3>Concepts</h3></div><div class="card list" id="concepts"></div>';
    list(main.querySelector("#concepts"), {
      items: mine,
      cols: [{ label: "Concept name", key: "name" }].concat(picker ? [{ label: "Team" }] : [],
        [{ label: "Size", key: "size", cls: "wide-only" }, { label: "Share links", key: "shares", cls: "wide-only roomy" }, { label: "Updated", key: "updated" }, { label: "", cls: "acts" }]),
      sort: { key: "updated", dir: -1 },
      value: function (b, k) { return k === "name" ? b.name : k === "size" ? b.size : k === "shares" ? b.shares : b.publishedAt; },
      text: function (b) { return b.name + " " + b.by; },
      row: function (b) {
        var href = "portal.html?b=" + encodeURIComponent(b.id);
        // a concept published again from Unity keeps its place, links and values: its version counts the publishes
        return '<tr data-href="' + esc(href) + '"><td><div class="name"><a href="' + esc(href) + '">' + esc(b.name) + "</a>" + (b.revision > 1 ? '<span class="pill">version ' + b.revision + "</span>" : "") + "</div></td>" +
          (picker ? "<td>" + app.teamCell(b, teams) + "</td>" : "") + '<td class="wide-only">' + mb(b.size) + '</td><td class="wide-only roomy">' + b.shares + "</td>" +
          "<td>" + app.day(b.publishedAt) + '<div class="dim small">' + esc(b.by) + '</div></td><td class="acts">' + (b.mayChange
            ? '<button class="icon-btn" data-rename="' + esc(b.id) + '" title="Rename" aria-label="Rename ' + esc(b.name) + '">' + icon(PENCIL) + "</button>" +
              '<button class="icon-btn danger" data-delete="' + esc(b.id) + '" title="Delete" aria-label="Delete ' + esc(b.name) + '">' + icon(BIN) + "</button>" : "") +
          '<span class="chev">' + icon(NEXT) + "</span></td></tr>";
      },
      drawn: function (box) {
        app.wireBuildActions(box, mine);
        if (picker && app.wireTeamCells) app.wireTeamCells(box);
      },
    });
  }

  app.pages.builds = {
    title: "Builds",
    render: async function (main) {
      var r = await PS.call("builds", {}, { retry: true });
      everything = Promise.resolve(r);
      if (app.params.has("project")) return conceptsPage(main, r, app.params.get("project"), app.params.has("team") ? app.params.get("team") : null);
      projectsPage(main, r);
    },
  };

  function renameBuild(b, toPortal, back) {
    app.current = "builds";
    frame();
    app.main.innerHTML = "<h2>Rename " + esc(b.name) + '</h2><div class="card"><form><label>New name<input name="name" value="' + esc(b.name) + '" maxlength="80" required autofocus></label>' +
      '<p class="dim">Its share links, values and translations stay as they are.</p><button class="primary">Rename</button> <button type="button" id="cancel">Cancel</button><p class="err"></p></form></div>';
    var done = function () { if (toPortal) location.href = "portal.html?b=" + encodeURIComponent(b.id); else app.go(back || "builds"); };
    app.main.querySelector("#cancel").onclick = done;
    app.form(app.main.querySelector("form"), async function (d) { await PS.call("build_rename", { id: b.id, name: d.name }); everything = null; done(); });
  }
  function deleteBuild(b, back) {
    frame();
    app.main.innerHTML = "<h2>Delete " + esc(b.name) + '?</h2><div class="card"><p>This removes the build and its saved values for everyone' +
      (b.shares ? ", and " + b.shares + " share link" + (b.shares === 1 ? "" : "s") + " stop working" : "") + '. It can\'t be undone.</p>' +
      '<form class="row"><button class="danger">Delete it</button> <button type="button" id="keep">Keep it</button><p class="err"></p></form></div>';
    app.main.querySelector("#keep").onclick = function () { app.go(back || "builds"); };
    app.form(app.main.querySelector("form"), async function () { await PS.call("build_delete", { id: b.id }); everything = null; app.go(back || "builds"); });
  }

  // ---------------------------------------------------------------- team

  var ROLE = { lead: "Main admin", admin: "Admin", member: "Member" };
  app.pages.team = {
    title: "Team",
    show: function (me) { return me.admin; },
    render: async function (main) {
      var r = await PS.call("team", {}, { retry: true });
      if (r.noTeam) { main.innerHTML = '<h2>Team</h2><div class="card"><p class="dim">You aren\'t on a team yet, so there\'s nobody to manage here.</p></div>'; return; }
      main.innerHTML = "<h2>" + esc(r.teamName || "Team") + ' <span class="dim" id="shown"></span></h2>' + (lastReport || "") + '<div class="card"><input id="find" placeholder="Search by email or name" aria-label="Search people" style="margin-bottom:10px">' +
        '<table><thead><tr><th>Google account</th><th>Name</th><th>Role</th><th>Added</th><th></th></tr></thead><tbody id="people">' +
        r.people.map(function (u) {
          return '<tr data-find="' + esc((u.email + " " + u.name).toLowerCase()) + '"><td>' + esc(u.email) + "</td><td>" + esc(u.name) + "</td><td>" + (ROLE[u.role] || "") + "</td><td>" + when(u.createdAt) + "</td><td>" +
            (u.you ? '<span class="dim">you</span>' : u.mayChange ? '<button class="danger" data-remove="' + esc(u.email) + '">Remove</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
        '<div class="card"><h2>Add someone</h2><form id="add"><label>Their Google account (Gmail or a Google Workspace email)<input name="email" type="email" required></label>' +
        '<label>Name<input name="name"></label><p class="dim">They sign in with Google, here and in Unity. There\'s no password to pass on.</p><button class="primary">Add</button><p class="err"></p></form></div>' +
        '<div class="card"><h2>Add many</h2><form id="addMany"><label>One person per line: <code>email, name</code>. A spreadsheet\'s two columns pasted in work too.' +
        '<textarea name="rows" rows="6" style="display:block;width:100%;margin-top:6px;font:13px ui-monospace,monospace"></textarea></label><button class="primary">Add them</button><p class="err"></p></form></div>';
      lastReport = "";
      var find = main.querySelector("#find"), filter = function () {
        var q = find.value.trim().toLowerCase(), n = 0;
        main.querySelectorAll("#people tr").forEach(function (tr) { var show = !q || tr.dataset.find.includes(q); tr.style.display = show ? "" : "none"; if (show) n++; });
        main.querySelector("#shown").textContent = "(" + n + " of " + r.people.length + ")";
      };
      find.oninput = filter;
      filter();
      app.form(main.querySelector("#addMany"), async function (d) {
        var rows = String(d.rows || "").split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
          var c = l.split(l.indexOf("\t") >= 0 ? "\t" : ",").map(function (x) { return x.trim(); });
          return { email: c[0] || "", name: c[1] || "" };
        }).filter(function (x) { return !/^e-?mail$/i.test(x.email); });
        if (!rows.length) throw new Error("Paste at least one line.");
        var out = await PS.call("users_add_many", { rows: rows });
        lastReport = '<div class="card"><p class="' + (out.problems.length ? "err" : "ok") + '"><b>' + out.added + " added.</b>" + (out.problems.length ? " These weren't:" : "") + "</p>" +
          (out.problems.length ? "<table><tbody>" + out.problems.map(function (p) { return "<tr><td>Line " + p.line + "</td><td>" + esc(p.email) + "</td><td>" + esc(p.error) + "</td></tr>"; }).join("") + "</tbody></table>" : "") + "</div>";
        app.refresh();
      });
      main.querySelectorAll("[data-remove]").forEach(function (b) {
        b.onclick = async function () {
          if (!confirm("Remove " + b.dataset.remove + "? They can't sign in any more, here or in Unity.")) return;
          b.disabled = true;
          try { await PS.call("user_remove", { email: b.dataset.remove }); app.refresh(); } catch (e) { alert(e.message); b.disabled = false; }
        };
      });
      app.form(main.querySelector("#add"), async function (d) { await PS.call("user_add", { email: d.email, name: d.name }); app.refresh(); });
    },
  };
  var lastReport = "";

  // ---------------------------------------------------------------- downloads

  app.pages.downloads = {
    title: "Downloads",
    render: async function (main) {
      var r = await PS.call("downloads", {}, { retry: true });
      main.innerHTML = '<h2>Downloads</h2><div class="card"><h3>PlaySpell for Unity' + (r.pack ? ' <span class="dim">' + esc(r.pack.version) + " · " + mb(r.pack.size) + "</span>" : "") + "</h3>" +
        (r.pack ? "<p>Drag this file onto Unity's <b>Project</b> window, press <b>Import</b>, then press <b>Ctrl+H</b> and sign in with Google.</p>" +
          '<button class="primary" id="getPack">Download the Unity package</button><p class="err" id="packErr"></p>'
          : '<p class="dim">The package isn\'t on this portal yet.</p>') + "</div>" +
        '<div class="card"><h3>How to use PlaySpell</h3>' + (r.guide ? "<p>Step by step, from installing it to sharing a playable. Open the file in your browser.</p>" +
          '<button class="primary" id="getGuide">Download the how-to file</button><p class="err" id="guideErr"></p>' : '<p class="dim">The how-to file isn\'t on this portal yet.</p>') + "</div>";
      var pack = main.querySelector("#getPack"), guide = main.querySelector("#getGuide");
      if (pack) pack.onclick = async function () {
        pack.disabled = true;
        try { var d = await PS.call("download", { what: "package" }); location.href = d.url; }
        catch (e) { main.querySelector("#packErr").textContent = e.message; }
        finally { pack.disabled = false; }
      };
      if (guide) guide.onclick = async function () {
        guide.disabled = true;
        try { var d = await PS.call("download", { what: "guide" }); PS.saveText("PlaySpell-How-To-Use.html", d.text); }
        catch (e) { main.querySelector("#guideErr").textContent = e.message; }
        finally { guide.disabled = false; }
      };
    },
  };

  // ---------------------------------------------------------------- account

  app.pages.account = {
    title: "Account",
    render: async function (main) {
      var r = await PS.call("account", {}, { retry: true });
      var draw = function (tokens) {
        main.innerHTML = '<h2>Account</h2><div class="card"><p>You sign in with your Google account <b>' + esc(PS.me.email) + "</b>. There's no PlaySpell password.</p></div>" +
          '<div class="card"><h2>Unity sign-ins</h2><p class="dim">Computers where Unity is signed in as you. Removing one signs it out: it locks on its next build.</p>' +
          (tokens.length ? "<table><thead><tr><th>Where</th><th>Signed in</th><th>Last renewed</th><th></th></tr></thead><tbody>" + tokens.map(function (t) {
            return "<tr><td>" + esc(t.label) + "</td><td>" + when(t.createdAt) + "</td><td>" + (when(t.lastUsed) || '<span class="dim">never</span>') + '</td><td><button class="danger" data-token="' + esc(t.id) + '">Remove</button></td></tr>';
          }).join("") + "</tbody></table>" : '<p class="dim">None yet.</p>') + "</div>";
        main.querySelectorAll("[data-token]").forEach(function (b) {
          b.onclick = async function () { b.disabled = true; try { draw((await PS.call("token_remove", { id: b.dataset.token })).tokens); } catch (e) { alert(e.message); b.disabled = false; } };
        });
      };
      draw(r.tokens);
    },
  };

  // ---------------------------------------------------------------- start

  async function start() {
    // the page's other scripts (insights.js) have added their pages
    if (document.readyState === "loading") await new Promise(function (r) { addEventListener("DOMContentLoaded", r, { once: true }); });
    var me = await PS.signIn(root);
    if (me.ui) PS.runExtra(me.ui);
    PS.onSignedOut = function () { everything = null; start(); };
    var renaming = params.get("rename");
    if (renaming) {
      params.delete("rename");
      try {
        var info = await PS.call("build_info", { id: renaming });
        history.replaceState(null, "", location.pathname + "#builds");
        return renameBuild({ id: renaming, name: info.name }, params.get("back") === "portal");
      } catch (e) { /* not theirs or gone: the list instead */ }
    }
    // extra pages register themselves when their code has run, and say so
    if (me.ui) await Promise.race([extended, new Promise(function (r) { setTimeout(r, 3000); })]);
    app.go(location.hash.slice(1) || "builds");
  }
  addEventListener("hashchange", function () { if (PS.me) app.go(location.hash.slice(1) || "builds"); });
  start();
})();
