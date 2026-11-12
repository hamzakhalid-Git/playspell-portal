// The online portal's main page: builds, team, downloads and account, drawn here from what the server sends.
// Each page is a renderer in PS.app.pages, so code the server sends for some accounts can add pages or replace one.
(function () {
  "use strict";
  var PS = window.PS, esc = PS.esc, when = PS.when, mb = PS.mb;
  var root = document.getElementById("app");
  var params = new URLSearchParams(location.search);

  var app = PS.app = { pages: {}, order: ["builds", "team", "downloads", "account"], current: "", main: null, banner: "" };
  var extended = new Promise(function (r) { app.extended = r; });

  function frame() {
    var me = PS.me, nav = app.order.filter(function (k) { var p = app.pages[k]; return p && (!p.show || p.show(me)); });
    root.innerHTML = '<header><b>✦ PlaySpell</b>' + nav.map(function (k) {
      return '<a href="#' + k + '"' + (k === app.current ? ' class="on"' : "") + ">" + esc(app.pages[k].title) + "</a>";
    }).join("") + '<span class="right"><span class="dim">' + esc(me.email) + '</span><button id="signOut">Sign out</button></span></header>' +
      (app.banner ? '<p class="err banner">' + app.banner + "</p>" : "") + "<main></main>";
    app.main = root.querySelector("main");
    root.querySelector("#signOut").onclick = function () { PS.signOut(); location.hash = ""; start(); };
  }

  app.go = function (name) {
    if (!app.pages[name] || (app.pages[name].show && !app.pages[name].show(PS.me))) name = "builds";
    app.current = name;
    frame();
    var main = app.main;
    main.innerHTML = '<p class="dim">Loading…</p>';
    Promise.resolve().then(function () { return app.pages[name].render(main); }).catch(function (e) { main.innerHTML = '<div class="card"><p class="err">' + esc(e.message) + "</p></div>"; });
  };
  app.refresh = function () { app.go(app.current || "builds"); };
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

  // ---------------------------------------------------------------- builds

  app.buildRow = function (b) {
    return '<tr><td><a href="portal.html?b=' + encodeURIComponent(b.id) + '"><b>' + esc(b.name) + "</b></a></td><td>" + esc(b.project) + "</td>" +
      "<td>" + mb(b.size) + "</td><td>" + when(b.publishedAt) + '<br><span class="dim">' + esc(b.by) + "</span></td><td>" + b.shares + "</td>" +
      "<td>" + (b.mayChange ? '<button class="link" data-rename="' + esc(b.id) + '">Rename</button> · <button class="link" data-delete="' + esc(b.id) + '">Delete</button>' : "") + "</td></tr>";
  };
  app.wireBuildActions = function (main, builds) {
    main.querySelectorAll("[data-rename]").forEach(function (el) { el.onclick = function () { renameBuild(builds.find(function (b) { return b.id === el.dataset.rename; })); }; });
    main.querySelectorAll("[data-delete]").forEach(function (el) { el.onclick = function () { deleteBuild(builds.find(function (b) { return b.id === el.dataset.delete; })); }; });
  };
  app.pages.builds = {
    title: "Builds",
    render: async function (main) {
      var r = await PS.call("builds", {}, { retry: true });
      main.innerHTML = '<h2>Builds</h2><div class="card">' + (r.builds.length
        ? "<table><thead><tr><th>Name</th><th>Project</th><th>Size</th><th>Published</th><th>Share links</th><th></th></tr></thead><tbody>" + r.builds.map(app.buildRow).join("") + "</tbody></table>"
        : r.noTeam ? '<p class="dim">You aren\'t on a team yet. Ask your admin to add you to one, and your team\'s builds will show here.</p>'
          : '<p class="dim">Nothing published yet. Get PlaySpell from <a href="#downloads">Downloads</a>, then press <b>Publish</b> on its Build tab in Unity.</p>') + "</div>";
      app.wireBuildActions(main, r.builds);
    },
  };

  function renameBuild(b, back) {
    app.current = "builds";
    frame();
    app.main.innerHTML = "<h2>Rename " + esc(b.name) + '</h2><div class="card"><form><label>New name<input name="name" value="' + esc(b.name) + '" maxlength="80" required autofocus></label>' +
      '<p class="dim">Its share links, values and translations stay as they are.</p><button class="primary">Rename</button> <button type="button" id="cancel">Cancel</button><p class="err"></p></form></div>';
    var done = function () { if (back) location.href = "portal.html?b=" + encodeURIComponent(b.id); else app.go("builds"); };
    app.main.querySelector("#cancel").onclick = done;
    app.form(app.main.querySelector("form"), async function (d) { await PS.call("build_rename", { id: b.id, name: d.name }); done(); });
  }
  function deleteBuild(b) {
    frame();
    app.main.innerHTML = "<h2>Delete " + esc(b.name) + '?</h2><div class="card"><p>This removes the build and its saved values for everyone' +
      (b.shares ? ", and " + b.shares + " share link" + (b.shares === 1 ? "" : "s") + " stop working" : "") + '. It can\'t be undone.</p>' +
      '<form class="row"><button class="danger">Delete it</button> <button type="button" id="keep">Keep it</button><p class="err"></p></form></div>';
    app.main.querySelector("#keep").onclick = function () { app.go("builds"); };
    app.form(app.main.querySelector("form"), async function () { await PS.call("build_delete", { id: b.id }); app.go("builds"); });
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
    var me = await PS.signIn(root);
    if (me.ui) PS.runExtra(me.ui);
    PS.onSignedOut = function () { start(); };
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
