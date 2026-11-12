// The online portal's pages share this: talking to the portal's server, and signing in with Google.
// The server is a Google Apps Script web app (window.PLAYSPELL.gatekeeper). Requests are POSTs with a text/plain body,
// so the browser sends them without asking first, which Apps Script couldn't answer. Only a session token is kept,
// in this tab's sessionStorage; Google's own sign-in token is sent once and dropped.
(function () {
  "use strict";
  var C = window.PLAYSPELL || {};
  var KEY = "playspell:session";
  var session = null;
  try { session = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { session = null; }
  if (session && !(session.expires > Date.now() + 60000)) session = null;

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var when = function (t) { return t ? new Date(t).toISOString().slice(0, 16).replace("T", " ") + " UTC" : ""; };
  var mb = function (n) { return ((n || 0) / 1048576).toFixed(1) + " MB"; };

  // retry: only for requests that are harmless to repeat. A POST that Apps Script redirected and the browser re-sent as
  // a GET never ran (the answer says so), so that one is always safe to send again.
  async function call(action, body, opts) {
    opts = opts || {};
    if (!C.gatekeeper) throw new Error("This portal isn't set up yet: config.js has no server address.");
    var payload = JSON.stringify(Object.assign({ action: action }, body || {}, session && !opts.noSession ? { session: session.token } : {}));
    for (var attempt = 0; ; attempt++) {
      var text;
      try {
        var res = await fetch(C.gatekeeper, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload, credentials: "omit", redirect: "follow", cache: "no-store" });
        text = await res.text();
        if (!res.ok && !/^[{P]/.test(text)) throw new Error("HTTP " + res.status);
      } catch (e) {
        if (opts.retry && attempt < 2) { await wait(700 * (attempt + 1)); continue; }
        throw new Error("Couldn't reach the portal. Check your connection and try again.");
      }
      if (text.lastIndexOf("PS1 text\n", 0) === 0) return { text: text.slice(9) };
      if (text.lastIndexOf("PS1 b64\n", 0) === 0) return { b64: text.slice(8) };
      var j;
      try { j = JSON.parse(text); } catch (e) {
        if (opts.retry && attempt < 2) { await wait(700 * (attempt + 1)); continue; }
        throw new Error("The portal answered strangely. Try again.");
      }
      if (j.code === "get_not_supported" && attempt < 2) { await wait(400); continue; }
      if (j.status === 401 && session && !opts.noSession) { forget(); if (PS.onSignedOut) PS.onSignedOut(); }
      if (j.status >= 400) { var err = new Error(j.error || "Something went wrong."); err.status = j.status; throw err; }
      return j;
    }
  }

  function remember(r) {
    session = { token: r.session, expires: r.expires, me: r.me };
    try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch (e) { /* private mode: this page only */ }
  }
  function forget() {
    session = null;
    try { sessionStorage.removeItem(KEY); } catch (e) { /* nothing kept */ }
  }

  // Google's sign-in script, loaded once
  var gis = null;
  function loadGoogle() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    if (!gis) gis = new Promise(function (ok, no) {
      var s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = function () { ok(); };
      s.onerror = function () { gis = null; no(new Error("Couldn't load Google sign-in. Check your connection.")); };
      document.head.appendChild(s);
    });
    return gis;
  }

  // Shows a sign-in card in `box` until someone on the portal signs in; resolves with who that is.
  function signIn(box, note) {
    if (session) return Promise.resolve(session.me);
    return new Promise(function (resolve) {
      box.innerHTML = '<div class="login"><h2>✦ PlaySpell</h2><div class="card">' + (note ? "<p>" + esc(note) + "</p>" : "") +
        '<p class="dim">Sign in with the Google account your admin added to the portal.</p><div id="psGoogle"></div><p class="err" id="psSignErr"></p></div></div>';
      var errBox = box.querySelector("#psSignErr");
      if (!C.googleClientId) { errBox.textContent = "This portal isn't set up yet: config.js has no Google client."; return; }
      loadGoogle().then(function () {
        google.accounts.id.initialize({
          client_id: C.googleClientId, auto_select: true, cancel_on_tap_outside: false, itp_support: true, use_fedcm_for_prompt: true,
          callback: function (r) {
            errBox.textContent = "Signing in…";
            errBox.className = "dim";
            call("google_login", { credential: r.credential }, { noSession: true }).then(function (out) {
              remember(out);
              resolve(out.me);
            }, function (e) {
              errBox.className = "err";
              errBox.textContent = e.message;
              try { google.accounts.id.disableAutoSelect(); } catch (x) { /* nothing to undo */ }
            });
          },
        });
        google.accounts.id.renderButton(box.querySelector("#psGoogle"), { theme: "outline", size: "large", text: "signin_with", shape: "rectangular" });
        google.accounts.id.prompt();
      }, function (e) { errBox.textContent = e.message; });
    });
  }

  function signOut() {
    var had = session;
    forget();
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) { /* not loaded */ }
    return had;
  }

  // Runs code the server sends for this account (extra pages some accounts have), from a blob, as the page's CSP allows.
  function runExtra(code) {
    if (!code) return;
    var url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    var s = document.createElement("script");
    s.src = url;
    s.onload = function () { URL.revokeObjectURL(url); };
    document.head.appendChild(s);
  }

  // A file the browser saves, from text or a server address.
  function saveText(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/html" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  var PS = window.PS = {
    config: C, call: call, signIn: signIn, signOut: signOut, runExtra: runExtra, saveText: saveText,
    esc: esc, when: when, mb: mb,
    get me() { return session ? session.me : null; },
    onSignedOut: null,
  };
})();
