// Convert: a playable made for one network (or with PlaySpell) dropped here becomes every network's upload file. It all
// happens in this browser (tools/convert.mjs, bundled as convert-core.js): the file is never uploaded. Each file is
// then played in a sandboxed frame (check.html) with only that network's API, as the portal's Check files does
// (tools/portal/portal.html), and offered for download with what the check found.
(function () {
  "use strict";
  var PS = window.PS, app = PS.app, esc = PS.esc, C = window.PlaySpellConvert;
  if (!app || !C) return;
  var LABEL = {}, flat = null, made = [], busy = false, stem = "playable";
  C.NETWORK_IDS.forEach(function (id) { LABEL[id] = C.NETWORKS[id].label; });
  var size = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + " KB" : (n / 1048576).toFixed(2) + " MB"; };

  function save(name, bytes, type) {
    var url = URL.createObjectURL(new Blob([bytes], { type: type || "application/octet-stream" }));
    var a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  // ---------------------------------------------------------------- the check: the file in its network's stand-in

  function check(out) {
    var spec = C.CHECK[out.network], problems = [], warnings = [], frame = document.getElementById("cvFrame");
    var got = { cta: [], end: [], ready: 0, errors: [], outside: [], urls: [] }, waiting = null;
    var listen = function (e) {
      if (e.source !== frame.contentWindow) return;
      if (e.data === "download") got.cta.push("download");
      if (e.data === "complete") got.end.push("complete");
      var m = e.data;
      if (!m || !m.psCheck) return;
      if (m.type === "cta") got.cta.push(m.text);
      if (m.type === "url") got.urls.push(m.text);
      if (m.type === "end") got.end.push(m.text);
      if (m.type === "gameReady") got.ready++;
      if (m.type === "error" && m.text) got.errors.push(m.text);
      if (m.type === "outside") got.outside.push(m.text);
      if (waiting && waiting.type === m.type) { var w = waiting; waiting = null; w.done(m.text); }
    };
    var send = function (cmd) { frame.contentWindow.postMessage(typeof cmd === "string" ? { cmd: cmd } : cmd, "*"); };
    var wait = function (type, ms, ask) {
      return new Promise(function (done) {
        var t = setTimeout(function () { waiting = null; done(null); }, ms);
        waiting = { type: type, done: function (x) { clearTimeout(t); done(x); } };
        if (ask) ask();
      });
    };
    var pause = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    var state = async function () { await pause(120); var j = await wait("state", 3000, function () { send("state"); }); return j ? JSON.parse(j) : {}; };
    addEventListener("message", listen);
    return (async function () {
      try {
        // a fresh frame, then the file
        if ((await wait("waiting", 15000, function () { frame.src = "check.html?" + Date.now(); })) === null) { problems.push("The check couldn't start here: reload the page and try again"); return; }
        var started = performance.now(), booted = wait("booted", 45000);
        send({ psCheckLoad: C.checkPage(out.html, out.network) });
        if ((await booted) === null) { problems.push("The game didn't start within 45 s" + (got.errors.length ? ": " + got.errors[0] : "")); return; }
        var loadTime = (performance.now() - started) / 1000;
        if (loadTime > 10) warnings.push("Took " + loadTime.toFixed(1) + " s to start here; networks want it quicker");
        var s0 = await state(), own = !!s0.own;
        if (spec.kind === "mraid" || spec.kind === "dapi") {
          send("ready");
          var s = await state();
          if (!s.paused) problems.push("Keeps playing while the ad isn't viewable");
          send("show");
          s = await state();
          if (s.paused) problems.push("Doesn't start when the ad becomes viewable");
        }
        if (spec.kind === "mintegral") {
          // a PlaySpell game says it's ready once its shaders are warm, a moment after it starts
          if (!got.ready) await wait("gameReady", 10000);
          await pause(300);
          if (got.ready !== 1) problems.push("gameReady was called " + got.ready + " time(s), not once");
          var hooks = await wait("hooks", 3000, function () { send("hooks"); });
          if (hooks !== "function function") problems.push("gameStart and gameClose have to be global functions");
        }
        if (spec.kind !== "plain") {
          send("hide");
          var h = await state();
          if (!h.paused) problems.push("Doesn't pause when the ad is hidden");
          else if (!own) { await pause(400); var h2 = await state(); if (h2.frames > h.frames) problems.push("Keeps drawing while the ad is hidden"); }
          send("show");
          h = await state();
          if (h.paused) problems.push("Doesn't resume when the ad is shown again");
        }
        var a = await state(); await pause(600); var z = await state();
        if (!z.canvas) (own ? problems : warnings).push(own ? "Nothing to draw on: no canvas" : "No canvas found: check the game shows in the network's preview");
        else if (z.frames <= a.frames) (z.hidden ? warnings : problems).push(z.hidden ? "Couldn't watch it draw: keep this tab in front while it checks" : "The game isn't drawing any new frames");
        else if (Number(await wait("colours", 3000, function () { send("colours"); })) === 1) problems.push("The screen is one flat colour: the game isn't showing anything");
        if (spec.end) {
          send("end"); await pause(200);
          if (got.end[0] !== spec.end) problems.push("The game's end should call " + spec.end + "; it called " + (got.end[0] || "nothing"));
          send("end"); await pause(200);
          if (got.end.length > 1) problems.push(spec.end + " went out twice");
          await pause(1600);
        }
        // the install button, as the game's own code calls it
        var wanted = spec.cta || spec.api, calls = C.testCalls(flat);
        for (var i = 0; i < calls.length; i++) {
          var before = got.cta.length, urls = got.urls.length;
          send({ cmd: "call", code: calls[i] }); await pause(350);
          var now = got.cta.slice(before);
          if (now.length !== 1 || now[0] !== wanted) problems.push("The install button (" + calls[i].replace(/\(.*\)$/, "()") + ") should call " + wanted + "; it called " + (now.join(", ") || "nothing"));
          else if (wanted === "mraid.open" && !/^https?:\/\//.test(got.urls[urls] || "")) problems.push("mraid.open got no store address: add the store links");
          if (i < calls.length - 1) await pause(1700);
        }
        new Set(got.outside).forEach(function (x) { problems.push("Reached outside the file: " + x); });
        new Set(got.errors).forEach(function (x) { problems.push("Script error: " + x); });
      } catch (e) {
        problems.push("The check failed: " + e.message);
      } finally {
        removeEventListener("message", listen);
        waiting = null;
      }
    })().then(function () { return { problems: problems, warnings: warnings }; });
  }

  // ---------------------------------------------------------------- the page

  function status(r) {
    if (!r) return '<span class="dim">waiting</span>';
    if (r.running) return '<span class="dim">checking…</span>';
    var st = r.problems.length ? "err" : r.warnings.length ? "warn" : "ok";
    return '<span class="cv-st ' + st + '">' + (st === "err" ? "✕ Fix" : st === "warn" ? "! Check" : "✓ Pass") + "</span>" +
      r.problems.map(function (t) { return '<div class="cv-issue err">' + esc(t) + "</div>"; }).join("") +
      r.warnings.map(function (t) { return '<div class="cv-issue warn">' + esc(t) + "</div>"; }).join("");
  }
  function drawResults(main) {
    var box = main.querySelector("#cvOut");
    if (!made.length) { box.innerHTML = ""; return; }
    var done = made.every(function (m) { return m.result && !m.result.running; });
    var bad = made.filter(function (m) { return m.result && m.result.problems && m.result.problems.length; }).length;
    box.innerHTML = '<div class="card"><div class="row ins-tablehead"><h3>Files ' + (done ? '<span class="dim">· ' + (made.length - bad) + " of " + made.length + " passed</span>" : '<span class="dim">· checking, keep this tab in front</span>') + "</h3>" +
      (done ? '<button class="primary" id="cvAllDl">Download all (ZIP)</button>' : "") + "</div>" +
      '<table class="cv-table"><thead><tr><th>Network</th><th>File</th><th>Size</th><th>Check</th><th></th></tr></thead><tbody>' +
      made.map(function (m, i) {
        return "<tr><td><b>" + esc(m.out.label) + "</b></td><td><code>" + esc(m.file.name) + "</code>" + (m.out.pkg === "zip" ? '<br><span class="dim">' + esc(m.out.files.map(function (f) { return f.path; }).join(", ")) + "</span>" : "") + "</td><td>" + size(m.file.bytes.length) + "</td><td>" + status(m.result) +
          '</td><td><button data-dl="' + i + '"' + (m.result && !m.result.running ? "" : " disabled") + ">Download</button></td></tr>";
      }).join("") + "</tbody></table>" +
      (done ? '<p class="dim">✓ Pass: works as that network asks in this check. ! Check: have a look. ✕ Fix: the network will turn it down or it won\'t work there. Upload each file to its network\'s own test tool too, as <a href="#downloads">the how-to file</a> says.</p>' : "") + "</div>";
    box.querySelectorAll("[data-dl]").forEach(function (b) { b.onclick = function () { var m = made[Number(b.dataset.dl)]; save(m.file.name, m.file.bytes, m.out.pkg === "zip" ? "application/zip" : "text/html"); }; });
    // made while the checks finish, so the download starts on the click (a browser asks before a late one)
    var all = box.querySelector("#cvAllDl");
    if (all) all.onclick = async function () {
      all.disabled = true;
      try { save(stem + "_all_networks.zip", allZip || await zipAll(), "application/zip"); }
      finally { all.disabled = false; }
    };
  }
  var allZip = null;
  function zipAll() {
    return C.makeZip(made.map(function (m) { return { path: m.out.network + "/" + m.file.name, bytes: m.file.bytes }; })).then(function (z) { allZip = z; return z; });
  }
  function form() {
    var f = document.getElementById("cvForm"), d = {};
    new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); });
    d.networks = Array.prototype.map.call(f.querySelectorAll("input[name=net]:checked"), function (x) { return x.value; });
    return d;
  }

  async function run(main) {
    if (busy) return;
    var d = form();
    if (!/^[A-Za-z0-9_]{1,60}$/.test(d.stem)) throw new Error("The name may only use letters, numbers and underscores.");
    if (!d.networks.length) throw new Error("Tick at least one network.");
    busy = true;
    stem = d.stem;
    var frame = main.querySelector("#cvFrame");
    made = []; allZip = null;
    try {
      for (var i = 0; i < d.networks.length; i++) {
        var out = C.build(flat, d.networks[i], { stem: d.stem, ios: d.ios, android: d.android, orientation: d.orientation, title: flat.info.title });
        made.push({ out: out, file: await C.pack(out) });
      }
      zipAll();
      drawResults(main);
      frame.style.display = "";
      for (i = 0; i < made.length; i++) {
        var m = made[i], fixed = C.issues(m.out, flat, m.file.bytes.length);
        m.result = { running: true };
        drawResults(main);
        var r = await check(m.out);
        m.result = { problems: Array.from(new Set(fixed.problems.concat(r.problems))), warnings: Array.from(new Set(fixed.warnings.concat(r.warnings))) };
        drawResults(main);
      }
    } finally {
      busy = false;
      frame.style.display = "none";
      frame.removeAttribute("src");
      window.__convertDone = true;
      window.__convert = made.map(function (m) { return { network: m.out.network, name: m.file.name, size: m.file.bytes.length, problems: m.result ? m.result.problems : null, warnings: m.result ? m.result.warnings : null }; });
    }
  }

  function setup(main, file) {
    var info = flat.info, src = flat.source;
    var nets = C.NETWORK_IDS.map(function (id) {
      var closed = !!C.NETWORKS[id].notice;
      return '<label class="cv-net"><input type="checkbox" name="net" value="' + id + '"' + (closed ? "" : " checked") + ">" + esc(LABEL[id]) + (closed ? ' <span class="dim">(closed to new ads)</span>' : "") + "</label>";
    }).join("");
    main.querySelector("#cvSetup").innerHTML = '<div class="card"><h3>' + esc(file.name) + ' <span class="dim">· ' + size(src.size) + (src.kind === "zip" ? " · ZIP of " + src.files.size + " files, opens " + esc(src.entry) : "") + "</span></h3>" +
      "<p>" + (info.madeFor.length ? "Made for <b>" + esc(info.madeFor.join(", ")) + "</b>." : "Made for no network in particular.") + "</p>" +
      flat.notes.map(function (t) { return '<p class="dim cv-note">' + esc(t) + "</p>"; }).join("") +
      flat.problems.map(function (t) { return '<p class="err cv-note">' + esc(t) + "</p>"; }).join("") +
      '<form id="cvForm"><div class="cv-fields">' +
      '<label>Name of the files<input name="stem" value="' + esc(flat.stem) + '" maxlength="60" required title="Letters, numbers and underscores"></label>' +
      '<label>Orientation<select name="orientation">' + [["both", "Portrait and landscape"], ["portrait", "Portrait"], ["landscape", "Landscape"]].map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === info.orientation ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>" +
      '<label>App Store link<input name="ios" value="' + esc(info.ios) + '" placeholder="https://apps.apple.com/app/id…"></label>' +
      '<label>Google Play link<input name="android" value="' + esc(info.android) + '" placeholder="https://play.google.com/store/apps/details?id=…"></label>' +
      '</div><p class="dim">Store links: ' + (info.ios || info.android ? "found in the playable; change them if they're wrong." : "Unity Ads and generic MRAID open the store from these; the other networks take it from the campaign.") + "</p>" +
      '<div class="cv-nets"><b>Networks</b> <button type="button" class="link" id="cvAll">all</button> · <button type="button" class="link" id="cvNone">none</button><div>' + nets + "</div></div>" +
      '<button class="primary" id="cvGo">Make and check the files</button> <span class="dim">Each file plays for a few seconds in a small frame at the bottom right while it\'s checked.</span><p class="err"></p></form></div>';
    var f = main.querySelector("#cvForm");
    main.querySelector("#cvAll").onclick = function () { f.querySelectorAll("input[name=net]").forEach(function (x) { x.checked = true; }); };
    main.querySelector("#cvNone").onclick = function () { f.querySelectorAll("input[name=net]").forEach(function (x) { x.checked = false; }); };
    app.form(f, function () { return run(main); });
  }

  async function take(main, file) {
    var err = main.querySelector("#cvErr");
    err.textContent = "";
    if (busy) { err.textContent = "Wait for the check to finish first."; return; }
    if (file.size > 60 * 1048576) { err.textContent = "That file is " + size(file.size) + "; a playable is a few MB."; return; }
    try {
      var src = await C.read(file.name, new Uint8Array(await file.arrayBuffer()));
      flat = C.flatten(src);
      made = [];
      window.__convertDone = false;
      setup(main, file);
      drawResults(main);
      window.__convertReady = true;
    } catch (e) {
      flat = null;
      main.querySelector("#cvSetup").innerHTML = "";
      err.textContent = e.message;
    }
  }

  app.pages.convert = {
    title: "Convert",
    render: function (main) {
      flat = null; made = [];
      main.innerHTML = "<h2>Convert</h2>" +
        '<div class="card cv-drop" id="cvDrop"><b>Drop a playable here</b>' +
        '<p class="dim">An HTML file or a ZIP, made for any ad network or with PlaySpell. It becomes each network\'s upload file, and each one is played here with that network\'s API to check it. Your file stays in this browser: nothing is uploaded.</p>' +
        '<label class="cv-pick">Choose a file<input type="file" id="cvFile" accept=".html,.htm,.zip,application/zip,text/html"></label><p class="err" id="cvErr"></p></div>' +
        '<div id="cvSetup"></div><div id="cvOut"></div>' +
        '<iframe id="cvFrame" class="cv-frame" title="File being checked" sandbox="allow-scripts" allow="autoplay" width="180" height="320" style="display:none"></iframe>';
      var drop = main.querySelector("#cvDrop"), input = main.querySelector("#cvFile");
      input.onchange = function () { if (input.files[0]) take(main, input.files[0]); input.value = ""; };
      ["dragenter", "dragover"].forEach(function (t) { main.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
      ["dragleave", "drop"].forEach(function (t) { main.addEventListener(t, function (e) { e.preventDefault(); if (t === "drop" || e.target === drop) drop.classList.remove("over"); }); });
      main.addEventListener("drop", function (e) {
        var f = e.dataTransfer && e.dataTransfer.files[0];
        if (f) take(main, f);
      });
    },
  };
})();
