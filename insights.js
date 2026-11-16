// The online portal's Insights page: how the team's live playables do, from the gatekeeper's "insights" answer
// (online/gatekeeper/Insights.js). Headline numbers against the previous period, impressions over time per concept,
// each concept's share, and a table of every concept, which also saves as CSV.
(function () {
  "use strict";
  var PS = window.PS, esc = PS.esc, app = PS.app;
  var NETWORKS = { applovin: "AppLovin", unity: "Unity Ads", ironsource: "ironSource", facebook: "Meta", moloco: "Moloco", google: "Google Ads", mintegral: "Mintegral", tiktok: "TikTok", vungle: "Liftoff", adcolony: "Generic MRAID", snapchat: "Snapchat" };
  var PERIODS = [[1, "Last 24 hours"], [7, "Last 7 days"], [30, "Last 30 days"], [90, "Last 90 days"]];
  var SLOTS = 5; // the concepts drawn on their own; the rest are "Other"
  var view = { days: 7, network: "", project: "", sort: "impressions", dir: -1, sample: false };
  var last = null, colorOf = {}, resizeTimer = 0;

  var n = function (v) { return Math.round(v || 0).toLocaleString("en-US"); };
  var pct = function (part, whole) { return whole > 0 ? (100 * part / whole).toFixed(2) + "%" : "–"; };
  var ipm = function (installs, whole) { return whole > 0 ? (1000 * installs / whole).toFixed(2) : "–"; };
  // what each number is a share of: the impressions that counted it (a playable's own events, or a network that
  // measures it). Store clicks are counted everywhere.
  var BASE = { engaged: "base_engaged", completed: "base_completed", crashes: "base_crashes", clicks: "impressions", installs: "base_installs" };
  var rate = function (c, m) { var b = c[BASE[m]]; return b > 0 ? c[m] / b : -1; };
  var netName = function (id) { return NETWORKS[id] || id; };
  var hasReports = function (r) { return r.sources.reports.length > 0; };

  // Each concept keeps its colour while the page is open, whatever the filters do; a concept new to the chart takes a
  // slot no other concept on it has.
  function colours(ids) {
    var used = {};
    ids.forEach(function (id) { if (colorOf[id] !== undefined && !used[colorOf[id]]) used[colorOf[id]] = id; else delete colorOf[id]; });
    ids.forEach(function (id) {
      if (colorOf[id] !== undefined) return;
      for (var s = 1; s <= SLOTS; s++) if (!used[s]) { used[s] = id; colorOf[id] = s; return; }
    });
    return function (id) { return id === "other" ? "var(--s-other)" : "var(--s" + colorOf[id] + ")"; };
  }

  // ---------------------------------------------------------------- headline numbers

  function sparkline(values) {
    var w = 120, h = 28, max = Math.max.apply(null, values.concat([0])), min = Math.min.apply(null, values.concat([max]));
    if (values.length < 2 || max === min) return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true"><line x1="0" y1="' + (h - 2) + '" x2="' + w + '" y2="' + (h - 2) + '"/></svg>';
    var pts = values.map(function (v, i) { return (i * w / (values.length - 1)).toFixed(1) + "," + (h - 2 - (v - min) / (max - min) * (h - 4)).toFixed(1); });
    return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts.join(" ") + '"/></svg>';
  }
  // a count's change in percent; a rate's in percentage points (IPM's in percent). Nothing to compare with when the
  // period before had none of what it's a share of.
  function change(m, now, before, isRate) {
    var base = BASE[m] || "impressions";
    if (BASE[m] && base !== "impressions" && !(last.totals[base] > 0)) return '<span class="dim">' + (m === "installs" ? "Only networks' reports count installs" : "Nothing counted this in the period") + "</span>";
    var short = (last.sources.short || []).map(netName);
    if (short.length) return '<span class="dim">' + esc(short.join(" and ")) + " " + (short.length > 1 ? "don't" : "doesn't") + " keep reports from the period before</span>";
    if (!(last.previous[base] > 0) || (!isRate && !(before > 0))) return '<span class="dim">No data for the period before</span>';
    var d = isRate ? (now - before) * 100 : (now - before) / before * 100;
    if (Math.abs(d) < 0.05) return '<span class="dim">Same as the period before</span>';
    var up = d > 0, text = Math.abs(d).toFixed(Math.abs(d) < 10 ? 1 : 0) + (isRate ? " pts " : "% ") + (up ? "up" : "down");
    return '<span class="' + (up ? "ok" : "err") + '">' + (up ? "▲ " : "▼ ") + "<b>" + text + "</b></span> <span class=\"dim\">from the period before</span>";
  }
  function kpis(r) {
    var t = r.totals, p = r.previous, tr = r.trend;
    // the small charts stop at the last whole point, as the timeline does: the one still filling would look like a jump
    var k = r.end > Date.now() && r.buckets > 1 ? r.buckets - 1 : r.buckets, whole = function (a) { return a.slice(0, k); };
    var ratio = function (m) { var b = tr[BASE[m]]; return whole(tr[m].map(function (v, i) { return b[i] ? v / b[i] : 0; })); };
    var share = function (o, m) { var b = o[BASE[m]]; return b ? o[m] / b : 0; };
    var card = function (title, help, value, delta, spark) {
      return '<div class="card kpi"><h3 title="' + esc(help) + '">' + title + '</h3><div class="big">' + value + "</div>" + spark + '<div class="delta">' + delta + "</div></div>";
    };
    var rated = function (title, help, m) { return card(title, help, pct(t[m], t[BASE[m]]), change(m, share(t, m), share(p, m), true), sparkline(ratio(m))); };
    return '<div class="kpis' + (hasReports(r) ? " k5" : "") + '">' +
      card("Impressions", "Times the playable was shown", n(t.impressions), change("impressions", t.impressions, p.impressions, false), sparkline(whole(tr.impressions))) +
      rated("Engagement", "Share of impressions where the player touched the game, where that is measured", "engaged") +
      rated("Completion rate", "Share of impressions played to the end (end card, or won or lost), where that is measured", "completed") +
      rated("Clicked to store", "Share of impressions with an install tap", "clicks") +
      (hasReports(r) ? card("IPM", "Installs per thousand impressions, from the networks' reports", ipm(t.installs, t.base_installs),
        change("installs", share(t, "installs"), share(p, "installs"), false), sparkline(ratio("installs"))) : "") +
      "</div>";
  }

  // ---------------------------------------------------------------- the concepts drawn: the top ones and "Other"

  function layers(r) {
    var shown = r.concepts.filter(function (c) { return r.series[c.id]; }).slice(0, SLOTS), ids = shown.map(function (c) { return c.id; });
    var out = shown.map(function (c) { return { id: c.id, name: c.name, values: r.series[c.id], total: c.impressions }; });
    var rest = r.concepts.filter(function (c) { return r.series[c.id] && ids.indexOf(c.id) < 0; });
    if (rest.length) {
      var values = new Array(r.buckets).fill(0), total = 0;
      rest.forEach(function (c) { r.series[c.id].forEach(function (v, i) { values[i] += v; }); total += c.impressions; });
      out.push({ id: "other", name: "Other (" + rest.length + ")", values: values, total: total });
    }
    return { list: out, colour: colours(ids) };
  }
  function legend(ls) {
    return '<ul class="legend">' + ls.list.map(function (l) { return '<li><i style="background:' + ls.colour(l.id) + '"></i>' + esc(l.name) + "</li>"; }).join("") + "</ul>";
  }

  // ---------------------------------------------------------------- timeline: impressions over time, stacked

  // the axis' top: the next round number above the highest point, in steps that split into four gridlines
  function niceMax(v) {
    if (v <= 0) return 4;
    var p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    var steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (f <= steps[i]) return steps[i] * p;
    return 10 * p;
  }
  function timeLabel(ms, days, withDay) {
    var d = new Date(ms);
    if (days <= 1 && !withDay) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    var day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return withDay && days <= 7 ? day + ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : day;
  }
  function timeline(box, r, ls) {
    var W = Math.max(260, box.clientWidth), H = box.clientWidth < 500 ? 240 : 320, L = 52, R = 12, T = 10, B = 28, w = W - L - R, h = H - T - B;
    // the point still filling (it ends after now) would look like a fall: the chart stops at the last whole one
    var k = r.end > Date.now() && r.buckets > 1 ? r.buckets - 1 : r.buckets, x = function (i) { return L + (k > 1 ? i * w / (k - 1) : w / 2); };
    var stack = [], base = new Array(k).fill(0);
    ls.list.forEach(function (l) { var top = l.values.slice(0, k).map(function (v, i) { return base[i] + v; }); stack.push({ l: l, lo: base, hi: top }); base = top; });
    var max = niceMax(Math.max.apply(null, base.concat([0]))), y = function (v) { return T + h - v / max * h; };
    var s = '<svg width="' + W + '" height="' + H + '" role="img" aria-label="Impressions over time per concept">';
    for (var g = 0; g <= 4; g++) {
      var gv = max * g / 4;
      s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(gv) + '" y2="' + y(gv) + '"/><text class="axis" x="' + (L - 8) + '" y="' + (y(gv) + 4) + '" text-anchor="end">' + n(gv) + "</text>";
    }
    // a label at each local midnight (or every few hours over a day), as many as fit
    var ticks = [], minGap = 64;
    for (var i = 0; i < k; i++) {
      var t = r.start + i * r.step, d = new Date(t), at = r.days <= 1 ? d.getHours() % 3 === 0 && d.getMinutes() === 0 : d.getHours() < r.step / 3600000 && d.getMinutes() === 0;
      if (r.days > 30) at = at && d.getDay() === 1;
      if (at && (!ticks.length || x(i) - x(ticks[ticks.length - 1]) >= minGap)) ticks.push(i);
    }
    if (!ticks.length) ticks.push(0);
    ticks.forEach(function (i) { s += '<text class="axis" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(timeLabel(r.start + i * r.step, r.days, false)) + "</text>"; });
    stack.forEach(function (layer) {
      var up = layer.hi.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }), down = layer.lo.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).reverse();
      s += '<polygon points="' + up.concat(down).join(" ") + '" fill="' + ls.colour(layer.l.id) + '"/>';
    });
    // a gap in the page's own colour between layers
    stack.forEach(function (layer) { s += '<polyline class="gap" points="' + layer.hi.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); }).join(" ") + '"/>'; });
    s += '<line class="baseline" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';
    s += '<line class="cross" x1="0" x2="0" y1="' + T + '" y2="' + (T + h) + '" visibility="hidden"/><rect class="hit" x="' + L + '" y="' + T + '" width="' + w + '" height="' + h + '"/></svg><div class="tip" hidden></div>';
    box.innerHTML = s;
    var svg = box.querySelector("svg"), cross = svg.querySelector(".cross"), tip = box.querySelector(".tip");
    var show = function (clientX) {
      var rect = svg.getBoundingClientRect(), px = clientX - rect.left, i = Math.max(0, Math.min(k - 1, Math.round((px - L) / (k > 1 ? w / (k - 1) : 1))));
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.setAttribute("visibility", "visible");
      var from = r.start + i * r.step, rows = ls.list.slice().reverse().map(function (l) { return '<div><i style="background:' + ls.colour(l.id) + '"></i>' + esc(l.name) + "<b>" + n(l.values[i]) + "</b></div>"; });
      tip.innerHTML = '<div class="dim">' + esc(timeLabel(from, r.days, true)) + " – " + esc(timeLabel(from + r.step, r.days, true)) + "</div>" + rows.join("") + '<div class="sum">Total<b>' + n(base[i]) + "</b></div>";
      tip.hidden = false;
      var left = x(i) + 14;
      if (left + tip.offsetWidth > W) left = x(i) - 14 - tip.offsetWidth;
      tip.style.left = Math.max(0, left) + "px";
    };
    var hide = function () { tip.hidden = true; cross.setAttribute("visibility", "hidden"); };
    svg.addEventListener("pointermove", function (e) { show(e.clientX); });
    svg.addEventListener("pointerdown", function (e) { show(e.clientX); });
    svg.addEventListener("pointerleave", hide);
  }

  // ---------------------------------------------------------------- distribution: each concept's share

  function donut(ls, total) {
    var R0 = 92, R1 = 58, C = 100, a = -Math.PI / 2, s = '<svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="Share of impressions per concept">';
    var arc = function (r, t) { return (C + r * Math.cos(t)).toFixed(2) + "," + (C + r * Math.sin(t)).toFixed(2); };
    ls.list.forEach(function (l) {
      if (!l.total) return;
      var sweep = l.total / total * Math.PI * 2, b = a + sweep, big = sweep > Math.PI ? 1 : 0;
      var d = sweep >= Math.PI * 2 - 1e-6
        ? "M" + arc(R0, a) + " A" + R0 + "," + R0 + " 0 1 1 " + arc(R0, a + Math.PI) + " A" + R0 + "," + R0 + " 0 1 1 " + arc(R0, a) + " M" + arc(R1, a) + " A" + R1 + "," + R1 + " 0 1 0 " + arc(R1, a + Math.PI) + " A" + R1 + "," + R1 + " 0 1 0 " + arc(R1, a) + "Z"
        : "M" + arc(R0, a) + " A" + R0 + "," + R0 + " 0 " + big + " 1 " + arc(R0, b) + " L" + arc(R1, b) + " A" + R1 + "," + R1 + " 0 " + big + " 0 " + arc(R1, a) + "Z";
      s += '<path d="' + d + '" fill="' + ls.colour(l.id) + '" fill-rule="evenodd"><title>' + esc(l.name) + ": " + n(l.total) + " (" + pct(l.total, total) + ")</title></path>";
      a = b;
    });
    s += '<text class="donut-total" x="100" y="98" text-anchor="middle">' + n(total) + '</text><text class="axis" x="100" y="116" text-anchor="middle">impressions</text></svg>';
    var rows = ls.list.map(function (l) { return '<li><i style="background:' + ls.colour(l.id) + '"></i><span>' + esc(l.name) + "</span><b>" + pct(l.total, total) + '</b><span class="dim">' + n(l.total) + "</span></li>"; });
    return s + '<ol class="shares">' + rows.join("") + "</ol>";
  }

  // ---------------------------------------------------------------- the table, and as CSV

  function columns(r) {
    return [["name", "Concept"], ["project", "Project"], ["impressions", "Impressions"], ["engaged", "Engagement"], ["completed", "Completion rate"], ["clicks", "Clicked to store"]]
      .concat(hasReports(r) ? [["installs", "IPM"]] : [], [["crashes", "Crashes"], ["last", "Last event"]]);
  }
  function sorted(list) {
    var k = view.sort, dir = view.dir, val = function (c) { return BASE[k] && k !== "crashes" ? rate(c, k) : c[k]; };
    return list.slice().sort(function (a, b) { var x = val(a), y = val(b); return (typeof x === "string" ? x.localeCompare(y) : x - y) * dir || b.impressions - a.impressions; });
  }
  function ago(ms) {
    if (!ms) return "";
    var m = Math.round((Date.now() - ms) / 60000);
    return m < 60 ? "within the hour" : m < 48 * 60 ? Math.round(m / 60) + " h ago" : new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function table(r) {
    var head = columns(r).map(function (c) {
      var on = view.sort === c[0];
      return '<th aria-sort="' + (on ? (view.dir > 0 ? "ascending" : "descending") : "none") + '"><button class="link sort" data-sort="' + c[0] + '">' + c[1] + (on ? (view.dir > 0 ? " ▲" : " ▼") : "") + "</button></th>";
    }).join("");
    // a share, with the count under it; "–" where nothing counted it
    var cell = function (c, m) {
      if (!(c[BASE[m]] > 0)) return '<td class="dim">–</td>';
      return "<td>" + (m === "installs" ? ipm(c[m], c[BASE[m]]) : pct(c[m], c[BASE[m]])) + '<br><span class="dim">' + n(c[m]) + "</span></td>";
    };
    var body = sorted(r.concepts).map(function (c) {
      var name = r.sample ? "<b>" + esc(c.name) + "</b>" : '<a href="portal.html?b=' + encodeURIComponent(c.id) + '"><b>' + esc(c.name) + "</b></a>";
      return "<tr><td>" + name + "</td><td>" + esc(c.project) + "</td><td>" + n(c.impressions) + "</td>" +
        cell(c, "engaged") + cell(c, "completed") + cell(c, "clicks") + (hasReports(r) ? cell(c, "installs") : "") +
        (c.base_crashes > 0 ? "<td>" + n(c.crashes) + "</td>" : '<td class="dim">–</td>') + '<td class="dim">' + ago(c.last) + "</td></tr>";
    }).join("");
    return '<table class="ins-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>";
  }
  function csv(r) {
    var q = function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var f = function (c, m, scale) { var b = c[BASE[m]]; return b > 0 ? (scale * c[m] / b).toFixed(2) : ""; };
    var counted = function (c, m) { return c[BASE[m]] > 0 ? Math.round(c[m]) : ""; };
    var lines = [["Concept", "Project", "Impressions", "Engaged", "Engagement %", "Completed", "Completion %", "Clicked to store", "Clicked to store %", "Installs", "IPM", "Crashes", "Last event (UTC)"].join(",")];
    sorted(r.concepts).forEach(function (c) {
      lines.push([q(c.name), q(c.project), Math.round(c.impressions), counted(c, "engaged"), f(c, "engaged", 100), counted(c, "completed"), f(c, "completed", 100), Math.round(c.clicks), f(c, "clicks", 100),
        counted(c, "installs"), f(c, "installs", 1000), counted(c, "crashes"), c.last ? new Date(c.last).toISOString() : ""].join(","));
    });
    return lines.join("\r\n") + "\r\n";
  }

  // ---------------------------------------------------------------- creatives in the networks' reports, to link

  function linking(r) {
    if (!r.unlinked || (!r.unlinked.length && !r.linked.length)) return "";
    var opts = '<option value="">Pick its concept…</option>' + r.linkable.map(function (b) {
      return '<option value="' + esc(b.id) + '">' + esc((b.project ? b.project + " · " : "") + b.name) + "</option>";
    }).join("") + '<option value="-">Not a PlaySpell playable</option>';
    var rows = r.unlinked.map(function (c) {
      return "<tr><td>" + esc(netName(c.network)) + '</td><td class="creative">' + esc(c.name || c.id) + "</td><td>" + n(c.impressions) + "</td><td>" +
        '<select data-network="' + esc(c.network) + '" data-creative="' + esc(c.id) + '" data-name="' + esc(c.name) + '" aria-label="Concept of ' + esc(c.name || c.id) + '">' + opts + "</select></td></tr>";
    });
    var done = r.linked.map(function (c) {
      return "<li>" + esc(netName(c.network)) + " · " + esc(c.name || c.id) + " → " + (c.ignored ? '<span class="dim">not a PlaySpell playable</span>' : "<b>" + esc(c.conceptName) + "</b>") +
        ' <button class="link" data-unlink="' + esc(c.network) + '" data-creative="' + esc(c.id) + '">Undo</button></li>';
    });
    return '<div class="card ins-link"><h3>Playables to link' + (rows.length ? ' <span class="dim">(' + rows.length + ")</span>" : "") + "</h3>" +
      '<p class="dim">The networks counted these playables, but no concept claims them yet. A file downloaded from a build\'s Export tab links by itself, through the <code>_ps…</code> in its name, as long as the network keeps that name. Only main admins see this list.</p>' +
      (rows.length ? '<table class="ins-table"><thead><tr><th>Network</th><th>Playable</th><th>Impressions</th><th>Concept</th></tr></thead><tbody>' + rows.join("") + "</tbody></table>"
        : '<p class="dim">Every playable with impressions in this period is linked.</p>') +
      '<p class="err" id="insLinkErr" hidden></p>' +
      (done.length ? "<details><summary>Linked by hand (" + done.length + ')</summary><ul class="linked">' + done.join("") + "</ul></details>" : "") + "</div>";
  }

  // ---------------------------------------------------------------- sample numbers
  // Before a network is connected, the page can show what Insights does with made-up numbers for made-up concepts,
  // in the shape of the gatekeeper's answer, and says so at the top. AppLovin-like: engagement, completion (for games
  // with a challenge), store clicks, crashes and installs, a daily rhythm, and a week a little better than the one before.

  var SAMPLE = [
    // name, project, impressions a day, engagement, completion (0: no challenge), store clicks, crashes per 10k, IPM
    ["Checkout - VIP bulk order", "Market Simulator", 52000, 0.71, 0.22, 0.09, 12, 14],
    ["Scan & tap - chips", "Market Simulator", 18000, 0.89, 0.67, 0.12, 2, 22],
    ["Checkout - Black Friday", "Market Simulator", 9000, 0.82, 0, 0.07, 6, 11],
    ["Rotate to scan", "Market Simulator", 3600, 0.78, 0.41, 0.06, 3, 9],
    ["Goods sort - shelves", "Goods Sort", 2600, 0.75, 0.58, 0.05, 0, 18],
    ["Fishing frenzy - reel", "Fishing", 1500, 0.69, 0.3, 0.05, 0, 8],
  ];
  var METRICS = ["impressions", "engaged", "completed", "clicks", "crashes", "installs", "base_engaged", "base_completed", "base_crashes", "base_installs"];
  function sampleAnswer(days, project) {
    var step = { 1: 3600000, 7: 3 * 3600000, 30: 86400000, 90: 86400000 }[days], now = Date.now();
    var end = Math.ceil(now / step) * step, start = end - days * 86400000, buckets = Math.round((end - start) / step), seed = 11;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var zero = function () { var o = {}; METRICS.forEach(function (m) { o[m] = 0; }); return o; };
    var r = {
      sample: true, days: days, step: step, start: start, end: end, buckets: buckets, totals: zero(), previous: zero(), concepts: [], series: {}, trend: {},
      sources: { analytics: false, tracking: [], reports: ["applovin"], errors: {}, short: [] }, networks: ["applovin"],
      projects: SAMPLE.map(function (s) { return s[1]; }).filter(function (p, i, a) { return a.indexOf(p) === i; }).sort(),
    };
    METRICS.forEach(function (m) { r.trend[m] = new Array(buckets).fill(0); });
    SAMPLE.forEach(function (s, k) {
      if (project && s[1] !== project) return;
      var c = Object.assign({ id: "sample" + k, name: s[0], project: s[1], last: now - (k * 9 + 4) * 60000 }, zero()), series = new Array(buckets).fill(0);
      for (var i = -buckets; i < buckets; i++) {
        var t = start + i * step, hours = Math.max(0, Math.min(step, now - t)) / 3600000;
        if (!hours) continue;
        var rhythm = step < 86400000 ? 0.55 + 0.45 * Math.sin(((new Date(t).getHours() - 9) / 24) * Math.PI * 2) : 0.85 + 0.15 * Math.sin((t / 86400000 / 7) * Math.PI * 2);
        var imp = (s[2] / 24) * hours * rhythm * (i < 0 ? 0.95 : 1) * (0.9 + 0.2 * rnd()), better = i < 0 ? 0.97 : 1;
        var v = {
          impressions: imp, engaged: imp * s[3] * better, completed: imp * s[4] * better, clicks: imp * s[5] * better, crashes: (imp * s[6]) / 10000,
          installs: (imp * s[7] * better) / 1000, base_engaged: imp, base_completed: s[4] ? imp : 0, base_crashes: imp, base_installs: imp,
        };
        METRICS.forEach(function (m) {
          if (i < 0) { r.previous[m] += v[m]; return; }
          r.totals[m] += v[m];
          c[m] += v[m];
          r.trend[m][i] += v[m];
        });
        if (i >= 0) series[i] += imp;
      }
      r.series[c.id] = series;
      r.concepts.push(c);
    });
    r.concepts.sort(function (a, b) { return b.impressions - a.impressions; });
    return r;
  }

  // what real numbers need, in place of where they come from
  function needs() {
    return '<div class="card"><h3>What real numbers need</h3><p class="dim">AppLovin\'s <b>Report Key</b>, from the ad account (AppLovin Ads Manager ▸ the account menu ▸ Keys). It\'s free, the portal only reads reports with it, and only the portal\'s server keeps it: nobody using the portal sees it.</p>' +
      '<p class="dim">With it, AppLovin reports each playable by day: impressions, engagement (players who touched it), completion (end card, or won or lost), store clicks, crashes, and installs, as IPM (installs per thousand impressions). A file downloaded from a build\'s Export tab finds its concept by itself, so each concept gets its own numbers, against the period before.</p></div>';
  }

  // ---------------------------------------------------------------- the page

  function filters(r) {
    var opt = function (v, label, cur) { return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? " selected" : "") + ">" + esc(label) + "</option>"; };
    var nets = r.networks.slice(), projects = r.projects.slice();
    if (view.network && nets.indexOf(view.network) < 0) nets.push(view.network);
    if (view.project && projects.indexOf(view.project) < 0) projects.push(view.project);
    return '<div class="row ins-filters">' +
      '<select id="insDays" aria-label="Period">' + PERIODS.map(function (p) { return opt(p[0], p[1], view.days); }).join("") + "</select>" +
      '<select id="insNet" aria-label="Network">' + opt("", "All networks", view.network) + nets.map(function (id) { return opt(id, netName(id), view.network); }).join("") + "</select>" +
      '<select id="insProj" aria-label="Project">' + opt("", "All projects", view.project) + projects.map(function (p) { return opt(p, p, view.project); }).join("") + "</select>" +
      '<button id="insRefresh">Refresh</button></div>';
  }
  function sources(r) {
    var tracked = r.sources.tracking.map(netName), reports = r.sources.reports.map(netName), errors = r.sources.errors || {};
    var own = !r.sources.analytics ? "" : "<p class=\"dim\">The playables themselves report each impression, first touch, end of play, install tap and crash, once each. " +
      (tracked.length ? "Files downloaded from the portal for <b>" + esc(tracked.join(", ")) + "</b> report. Other networks' files don't, and builds you test from Unity never do."
        : "No network's downloads report by themselves yet: the portal's owner picks which ones do.") +
      " These numbers are up to about 10 minutes old, and Google Analytics can take a few hours to count the latest ones.</p>";
    var nets = !reports.length ? "" : '<p class="dim"><b>' + esc(reports.join(", ")) + "</b> " + (reports.length > 1 ? "report" : "reports") +
      " each playable in the ad account by day, for the playables linked to a concept: impressions, store clicks and installs" +
      (r.sources.reports.indexOf("applovin") >= 0 ? "; AppLovin also engagement, crashes, and when the game has a challenge, completion" : "") +
      (r.sources.reports.indexOf("google") >= 0 ? "; Google Ads also engagement" : "") +
      ". In the 24-hour and 7-day views, each day's numbers are spread evenly over its hours. Where a playable reports by itself on a network too, its own numbers count there. Network reports here are up to about an hour old, and the networks can take hours to count the latest ones.</p>";
    var errs = Object.keys(errors).map(function (k) { return '<p class="err">' + esc(errors[k]) + "</p>"; }).join("");
    return '<div class="card"><h3>Where these numbers come from</h3>' + errs + own + nets + "</div>";
  }

  function draw(main, r) {
    last = r; // change() and the redraw on resize read it
    var head = '<div class="ins-head"><h2>Insights</h2>' + filters(r) + "</div>";
    if (r.noTeam && !r.concepts.length) { main.innerHTML = head + '<div class="card"><p class="dim">You aren\'t on a team yet. Ask your admin to add you to one, and your team\'s playables will show here.</p></div>'; return wire(main, r); }
    if (r.setup) {
      main.innerHTML = head + '<div class="card"><h3>Insights isn\'t set up yet</h3><p class="dim">Live numbers come from the ad networks\' own reports, which this portal\'s owner connects. Until then there\'s nothing to show.</p>' +
        '<p><button id="insSample">See it with sample numbers</button></p></div>';
      return wire(main, r);
    }
    var body = r.error ? '<div class="card"><p class="err">' + esc(r.error) + "</p></div>" : "";
    if (r.sample) body = '<div class="card ins-sample"><div class="row"><div><b>Sample numbers.</b> <span class="dim">This is how Insights looks once AppLovin\'s reports are connected. None of these numbers are real.</span></div><button id="insSampleOff">Back</button></div></div>' + body;
    if (!r.totals.impressions) {
      main.innerHTML = head + body + kpis(r) + '<div class="card"><p class="dim">No impressions in this period yet. Playables downloaded from the portal show up here once they run in ads.</p></div>' + linking(r) + sources(r);
      return wire(main, r);
    }
    var ls = layers(r);
    main.innerHTML = head + body + kpis(r) +
      '<div class="ins-charts"><div class="card"><h3>Timeline <span class="dim">· impressions</span></h3>' + legend(ls) + '<div class="timeline"></div></div>' +
      '<div class="card dist"><h3>Distribution</h3>' + donut(ls, r.totals.impressions) + "</div></div>" +
      '<div class="card"><div class="row ins-tablehead"><h3>Concepts <span class="dim">(' + r.concepts.length + ')</span></h3><button id="insCsv">Export as CSV</button></div>' + table(r) + "</div>" + (r.sample ? needs() : linking(r) + sources(r));
    timeline(main.querySelector(".timeline"), r, ls);
    wire(main, r);
  }

  function wire(main, r) {
    var load = function () { app.pages.insights.render(main); };
    main.querySelector("#insDays").onchange = function (e) { view.days = Number(e.target.value); load(); };
    main.querySelector("#insNet").onchange = function (e) { view.network = e.target.value; load(); };
    main.querySelector("#insProj").onchange = function (e) { view.project = e.target.value; load(); };
    main.querySelector("#insRefresh").onclick = load;
    var sampleOn = main.querySelector("#insSample"), sampleOff = main.querySelector("#insSampleOff");
    if (sampleOn) sampleOn.onclick = function () { view.sample = true; view.network = ""; view.project = ""; load(); };
    if (sampleOff) sampleOff.onclick = function () { view.sample = false; view.network = ""; view.project = ""; load(); };
    var save = main.querySelector("#insCsv");
    if (save) save.onclick = function () { PS.saveText("PlaySpell-Insights-" + new Date().toISOString().slice(0, 10) + ".csv", csv(r), "text/csv"); };
    main.querySelectorAll("[data-sort]").forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.sort;
        view.dir = view.sort === k ? -view.dir : k === "name" || k === "project" ? 1 : -1;
        view.sort = k;
        main.querySelector(".ins-table").outerHTML = table(r);
        wire(main, r);
      };
    });
    // linking a creative, setting it aside, or undoing that, then the page again with it counted
    var linkTo = async function (el, network, creative, name, concept) {
      el.disabled = true;
      try { await PS.call("insights_link", { network: network, creative: creative, name: name, concept: concept }); load(); } catch (e) {
        var err = main.querySelector("#insLinkErr");
        if (err) { err.textContent = e.message; err.hidden = false; }
        el.disabled = false;
      }
    };
    main.querySelectorAll(".ins-link select").forEach(function (s) {
      s.onchange = function () { if (s.value) linkTo(s, s.dataset.network, s.dataset.creative, s.dataset.name, s.value); };
    });
    main.querySelectorAll("[data-unlink]").forEach(function (b) {
      b.onclick = function () { linkTo(b, b.dataset.unlink, b.dataset.creative, "", ""); };
    });
  }

  app.pages.insights = {
    title: "Insights",
    wide: true,
    render: async function (main) {
      var r;
      if (view.sample) r = sampleAnswer(view.days, view.project);
      else {
        try { r = await PS.call("insights", { days: view.days, network: view.network, project: view.project }, { retry: true }); } catch (e) {
          // a gatekeeper from before Insights: as good as not set up
          if (e.status !== 404 || !/no such action/i.test(e.message)) throw e;
          r = { setup: true, networks: [], projects: [], concepts: [], sources: { analytics: false, tracking: [], reports: [], errors: {} } };
        }
      }
      if (app.current === "insights") draw(main, r);
    },
  };
  addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (app.current === "insights" && last && app.main && app.main.querySelector(".timeline")) draw(app.main, last); }, 150);
  });
})();
