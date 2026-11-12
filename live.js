// The build portal (portal.html, the same page Unity makes on a computer) on the online portal. That page asks for its
// build's files and the live portal's api/... by relative address; here those go to the server instead, for the build in
// ?b=. Build files never change, so each is fetched once per page. The page waits for sign-in first.
(function () {
  "use strict";
  var PS = window.PS;
  var id = new URLSearchParams(location.search).get("b") || "";
  var realFetch = window.fetch.bind(window);
  var files = new Map();
  var gate = document.createElement("div");
  gate.id = "psGate";
  gate.style.cssText = "position:fixed;inset:0;z-index:1000;background:var(--bg,#f5f6f8);overflow:auto";
  var ready = new Promise(function (resolve) {
    var go = function () {
      if (PS.me) { gate.remove(); return resolve(); }
      document.body.appendChild(gate);
      PS.signIn(gate).then(function () { gate.remove(); resolve(); });
    };
    if (document.body) go(); else addEventListener("DOMContentLoaded", go);
  });
  PS.onSignedOut = function () { location.reload(); };

  var answer = function (data, status) { return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json" } }); };
  var bytesOf = function (b64) { var s = atob(b64), out = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; };

  async function route(url, init) {
    var method = String(init.method || "GET").toUpperCase();
    var body = typeof init.body === "string" && init.body ? JSON.parse(init.body) : {};
    await ready;
    if (url === "api/ping") {
      var info = await PS.call("build_info", { id: id }, { retry: true });
      document.querySelectorAll("#allBuilds").forEach(function (a) { a.href = "./"; });
      return answer({ playspell: "portal", live: true, name: info.name, project: info.project, playUrl: info.playUrl, canRename: info.canRename });
    }
    if (url === "api/variations") {
      if (method === "GET") return answer((await PS.call("variations_get", { id: id }, { retry: true })).values);
      return answer({ saved: (await PS.call("variations_put", { id: id, data: body })).saved });
    }
    if (url === "api/shares") {
      if (method === "GET") return answer(await PS.call("shares_list", { id: id }, { retry: true }));
      return answer(await PS.call("share_create", { id: id, variation: body.variation, label: body.label }), 201);
    }
    var share = /^api\/shares\/([A-Za-z0-9_-]+)$/.exec(url);
    if (share) {
      await PS.call(method === "DELETE" ? "share_delete" : "share_set", { id: id, token: share[1], on: !!body.on });
      return answer({ ok: true });
    }
    if (url === "rename?back=portal") { location.href = "./?rename=" + encodeURIComponent(id) + "&back=portal"; return answer({}); }
    if (url.lastIndexOf("api/", 0) === 0) return answer({ error: "not on the online portal" }, 404);
    var path = url.split(/[?#]/)[0].replace(/^\.\//, "");
    if (!files.has(path)) files.set(path, PS.call("build_file", { id: id, path: path }, { retry: true }).catch(function (e) { files.delete(path); throw e; }));
    var f = await files.get(path);
    if (f.text !== undefined) return new Response(f.text, { headers: { "Content-Type": /\.json$/.test(path) ? "application/json" : "text/html; charset=utf-8" } });
    return new Response(bytesOf(f.b64), { headers: { "Content-Type": "application/octet-stream" } });
  }

  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input && input.url;
    // whole addresses (Google's, blobs, data) and the site's own files go as they are
    if (typeof url !== "string" || /^[a-z]+:/i.test(url) || url.charAt(0) === "/" || /^(config|shared|live|style)\.js$/.test(url)) return realFetch(input, init);
    return route(url, init || {}).catch(function (e) { return answer({ error: e.message }, e.status || 500); });
  };
  // the page's "Rename" link: on this site renaming happens on the main page
  addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a#renameBuild");
    if (!a) return;
    e.preventDefault();
    location.href = "./?rename=" + encodeURIComponent(id) + "&back=portal";
  }, true);
})();
