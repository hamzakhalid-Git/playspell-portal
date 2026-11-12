// Unity's Sign in button opens this page: unity.html?port=<n>&state=<random>&device=<name>. Once you're signed in with
// Google, the page hands Unity a one-time code through your own computer's address (127.0.0.1), which only Unity on
// this computer is listening on. Unity swaps the code for its sign-in with the server; the code works once, briefly.
(function () {
  "use strict";
  var PS = window.PS, esc = PS.esc, root = document.getElementById("app"), q = new URLSearchParams(location.search);
  var port = Number(q.get("port")), state = q.get("state") || "", device = String(q.get("device") || "").slice(0, 60);
  var page = function (html) { root.innerHTML = '<div class="login"><h2>✦ PlaySpell</h2><div class="card">' + html + "</div></div>"; };
  if (!(port >= 1024 && port <= 65535) || !/^[A-Za-z0-9]{16,64}$/.test(state)) {
    return page('<p class="err">Open this page from Unity: press <b>Sign in</b> in PlaySpell\'s window.</p>');
  }
  PS.signIn(root, "Signing Unity in" + (device ? " on " + device : "") + ".").then(async function (me) {
    page('<p class="dim">Signing Unity in as ' + esc(me.email) + "…</p>");
    try {
      var r = await PS.call("unity_code", { device: device });
      page("<p class=\"ok\"><b>Unity is signed in as " + esc(me.email) + ".</b></p><p>You can close this tab and go back to Unity.</p>");
      location.href = "http://127.0.0.1:" + port + "/playspell-signin?state=" + encodeURIComponent(state) + "&code=" + encodeURIComponent(r.code);
    } catch (e) {
      page('<p class="err">' + esc(e.message) + "</p>");
    }
  });
})();
