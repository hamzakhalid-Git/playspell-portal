// A share link: play.html?t=<link>[&lang=fr]. Anyone with the link can play, without signing in. The game runs in a
// sandboxed frame with no origin of its own, so it can't reach anything on this site.
//
// PlaySpell's loading screen (the sleeping panda, splash.js) shows from the moment the page opens, while the playable
// downloads from the portal's server, and stays through the game's own loading: the build's copy of it is switched
// off, and the game waits paused until the panda has fallen off and the screen fades, as in an ad.
(function () {
  "use strict";
  var C = window.PLAYSPELL || {}, q = new URLSearchParams(location.search), msg = document.getElementById("msg");
  var splash = window.PlaySpellSplash ? window.PlaySpellSplash.makeSplash() : null;
  var say = function (text) {
    if (splash) { splash.remove(); splash = null; }
    msg.textContent = text;
    msg.style.display = "flex";
  };
  if (splash) {
    msg.style.display = "none";
    // the download: the bar creeps while it lasts, however long that is
    splash.progress(0.5, 4500);
    setTimeout(function () { if (splash) splash.progress(0.7, 12000); }, 4500);
  }
  var token = q.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return say("This playable link isn't complete. Copy the whole link and try again.");
  var body = JSON.stringify({ action: "play", t: token, lang: q.get("lang") || "" });

  // In the game's page: start paused, say when loaded, and go when this page says so.
  var HELD = "<script>window.__playspellPaused = true;" +
    "window.__playspellReady = function () { parent.postMessage({ playspellShare: \"ready\" }, \"*\"); };" +
    "addEventListener(\"message\", function (e) { if (e.source === parent && e.data && e.data.playspellShare === \"start\") {" +
    " window.__playspellPaused = false; if (window.PlaySpell && PlaySpell.setPaused) PlaySpell.setPaused(false); } });</script>";

  function show(html) {
    if (splash) {
      // one loading screen: this page's; the game is held until it has gone
      html = html.replace('<div id="playspell-splash"', '<div id="playspell-splash-off" hidden').replace(/<head>/i, function (m) { return m + HELD; });
    }
    var frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("allow", "autoplay; fullscreen");
    frame.title = "Playable";
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      var go = function () { if (frame.contentWindow) frame.contentWindow.postMessage({ playspellShare: "start" }, "*"); };
      if (splash) splash.finish().then(go); else go();
    };
    window.addEventListener("message", function (e) {
      if (e.source === frame.contentWindow && e.data && e.data.playspellShare === "ready") start();
    });
    frame.addEventListener("load", function () {
      if (splash) splash.progress(0.88, 2500); // the game unpacks and gets its shaders ready
      setTimeout(start, 20000); // a build too old to say when it's ready
    });
    frame.srcdoc = html;
    document.body.appendChild(frame);
    if (!splash) msg.style.display = "none";
  }

  (async function load(attempt) {
    var text;
    try {
      var res = await fetch(C.gatekeeper, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body, credentials: "omit", cache: "no-store" });
      text = await res.text();
    } catch (e) {
      if (attempt < 2) return setTimeout(function () { load(attempt + 1); }, 800 * (attempt + 1));
      return say("Couldn't load the playable. Check your connection and try again.");
    }
    if (text.lastIndexOf("PS1 text\n", 0) !== 0) {
      var j = null;
      try { j = JSON.parse(text); } catch (e) { /* not an answer */ }
      if (j && j.code === "get_not_supported" && attempt < 2) return load(attempt + 1);
      return say(j && j.error ? j.error : "Couldn't load the playable. Try again in a moment.");
    }
    show(text.slice(9));
  })(0);
})();
