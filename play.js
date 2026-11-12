// A share link: play.html?t=<link>[&lang=fr]. Anyone with the link can play, without signing in. The game runs in a
// sandboxed frame with no origin of its own, so it can't reach anything on this site.
(function () {
  "use strict";
  var C = window.PLAYSPELL || {}, q = new URLSearchParams(location.search), msg = document.getElementById("msg");
  var say = function (text) { msg.textContent = text; msg.style.display = "flex"; };
  var token = q.get("t") || "";
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return say("This playable link isn't complete. Copy the whole link and try again.");
  var body = JSON.stringify({ action: "play", t: token, lang: q.get("lang") || "" });
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
    var frame = document.createElement("iframe");
    frame.setAttribute("sandbox", "allow-scripts");
    frame.setAttribute("allow", "autoplay; fullscreen");
    frame.title = "Playable";
    frame.srcdoc = text.slice(9);
    document.body.appendChild(frame);
    msg.style.display = "none";
  })(0);
})();
