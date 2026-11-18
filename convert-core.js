var PlaySpellConvert=(()=>{var z=Object.defineProperty;var he=Object.getOwnPropertyDescriptor;var me=Object.getOwnPropertyNames;var we=Object.prototype.hasOwnProperty;var ge=(e,t)=>{for(var n in t)z(e,n,{get:t[n],enumerable:!0})},ye=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of me(t))!we.call(e,a)&&a!==n&&z(e,a,{get:()=>t[a],enumerable:!(i=he(t,a))||i.enumerable});return e};var be=e=>ye(z({},"__esModule",{value:!0}),e);var Be={};ge(Be,{CHECK:()=>J,NETWORKS:()=>U,NETWORK_IDS:()=>G,build:()=>ue,checkPage:()=>We,flatten:()=>Re,inspect:()=>le,issues:()=>He,makeZip:()=>re,pack:()=>ze,portalFiles:()=>Ve,read:()=>Ce,readZip:()=>ae,stemOf:()=>se,testCalls:()=>Ge});var Y=e=>JSON.stringify(e??""),L=e=>`
  var IOS = ${Y(e.ios)}, AND = ${Y(e.android)};
  function storeUrl(){
    var ua = navigator.userAgent || "";
    var ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
    return (ios ? (IOS || AND) : (AND || IOS)) || "";
  }
  var fired = false;
  function guard(){ if (fired) return false; fired = true; setTimeout(function(){ fired = false; }, 1200); return true; }
  window.__playspellPaused = false; window.__playspellMuted = false;
  function pause(p){ window.__playspellPaused = !!p; try { if (window.PlaySpell && PlaySpell.setPaused) PlaySpell.setPaused(!!p); } catch(e){} }
  function mute(m){ window.__playspellMuted = !!m; try { if (window.PlaySpell && PlaySpell.setMuted) PlaySpell.setMuted(!!m); } catch(e){} }
  window.__playspellPause = pause; window.__playspellMute = mute;
  if (!window.__gameEnd) window.__gameEnd = function(){};`,ve={mraid:`
  if (!window.mraid) window.mraid = { getVersion:function(){return "2.0";}, getState:function(){return "default";},
    getPlacementType:function(){return "interstitial";}, isViewable:function(){return true;}, supports:function(){return false;},
    addEventListener:function(e,cb){ if (e==="ready") setTimeout(cb,0); if (e==="viewableChange") setTimeout(function(){cb(true);},0); },
    removeEventListener:function(){}, open:function(u){ __cta(u); }, close:function(){}, useCustomClose:function(){},
    getScreenSize:function(){return {width:innerWidth,height:innerHeight};}, getMaxSize:function(){return {width:innerWidth,height:innerHeight};},
    setOrientationProperties:function(){}, getOrientationProperties:function(){return {allowOrientationChange:true,forceOrientation:"none"};} };`,dapi:`
  if (!window.dapi) window.dapi = { isReady:function(){return true;}, isViewable:function(){return true;}, getAudioVolume:function(){return 1;},
    addEventListener:function(e,cb){ if (e==="ready") setTimeout(cb,0); }, removeEventListener:function(){}, openStoreUrl:function(){ __cta(); },
    getScreenSize:function(){return {width:innerWidth,height:innerHeight};} };`,exitapi:`
  window.ExitApi = window.ExitApi || {}; if (!window.ExitApi.exit) window.ExitApi.exit = function(){ __cta(); };`,fbplayable:`
  if (!window.FbPlayableAd) window.FbPlayableAd = { onCTAClick: function(){ __cta(); } };`,openappstore:`
  if (!window.openAppStore) window.openAppStore = function(){ __cta(); };`,scplayable:`
  if (!window.ScPlayableAd) window.ScPlayableAd = { onCTAClick: function(){ __cta(); } };`,install:`
  if (!window.install) window.install = function(){ __cta(); };`};function C(e){let t="";for(let[n,i]of Object.entries(ve))n!==e&&(t+=i);return t+`
  window.open = function(u){ __cta(typeof u === "string" ? u : null); return null; };`}var P=e=>`<script>
(function(){${e}
})();
<\/script>`;function W(e){return e?.analytics==="auto"||e?.analytics==="off"?e.analytics:"scripts"}function K(e,t){let n=W(t);return n==="auto"||n==="scripts"&&!!e?.challenge}var ke=(e,t)=>{let n=W(t)==="auto",i=n?Math.max(0,Math.floor(Number(t?.tapsToFinish)||0)):0;return`
  var AL = { loading:"LOADING", loaded:"LOADED", displayed:"DISPLAYED", challengeStarted:"CHALLENGE_STARTED",
    challengePass25:"CHALLENGE_PASS_25", challengePass50:"CHALLENGE_PASS_50", challengePass75:"CHALLENGE_PASS_75",
    challengeSolved:"CHALLENGE_SOLVED", challengeFailed:"CHALLENGE_FAILED", challengeRetry:"CHALLENGE_RETRY",
    endCardShown:"ENDCARD_SHOWN", cta:"CTA_CLICKED" };
  var tracking = ${K(e,t)?"true":"false"}, auto = ${n?"true":"false"}, sent = {}, early = [], out = [], since = Date.now(), waiting = false, gone = false;
  // automatic: the round's end is the challenge solved, unless the game lost it (and didn't try again)
  function solve(){ if (!sent.CHALLENGE_FAILED || sent.CHALLENGE_RETRY) window.__track("challengeSolved"); }
  function deliver(){
    var a = window.ALPlayableAnalytics;
    if (!a || typeof a.trackEvent !== "function") return false;
    while (out.length) { try { a.trackEvent(out.shift()); } catch(e){} }
    return true;
  }
  function send(e){
    if (sent[e] || gone) return;
    sent[e] = true; out.push(e);
    if (deliver() || waiting) return;
    // AppLovin's object may come a moment later; anywhere else it never does
    waiting = true;
    (function poll(){
      if (deliver()) { waiting = false; return; }
      if (Date.now() - since > 10000) { gone = true; out = []; return; }
      setTimeout(poll, 100);
    })();
  }
  window.__track = function(name){
    if (!tracking) return;
    if (name === "gameEnded") { if (auto) solve(); return; }
    if (name === "endCardShown" && auto) solve();
    var e = AL[name];
    if (!e) return;
    if (name === "loading" || name === "loaded") { if (!sent.DISPLAYED) send(e); return; }
    if (name === "displayed") { send(e); var held = early; early = []; held.forEach(window.__track); return; }
    if (!sent.DISPLAYED) { early.push(name); return; }
    if (name === "challengeRetry" && !sent.CHALLENGE_FAILED) return;
    if (/^challengePass/.test(name) && sent.CHALLENGE_SOLVED) return;
    if (/^challenge(Pass|Solved|Failed|Retry)/.test(name) && !sent.CHALLENGE_STARTED) send(AL.challengeStarted);
    send(e);
  };
  ${!K(e,t)||e?.challengeStart?"":`addEventListener("pointerdown", function first(){
    if (!sent.DISPLAYED) return;
    removeEventListener("pointerdown", first, true);
    window.__track("challengeStarted");
  }, true);`}
  ${i?`// automatic, by taps: ${i} finish the challenge
  var taps = 0, goal = ${i};
  addEventListener("pointerdown", function(){
    if (!sent.DISPLAYED || sent.CHALLENGE_SOLVED) return;
    taps++;
    if (taps * 4 >= goal) window.__track("challengePass25");
    if (taps * 2 >= goal) window.__track("challengePass50");
    if (taps * 4 >= goal * 3) window.__track("challengePass75");
    if (taps >= goal) solve();
  }, true);`:""}`},H=(e,t)=>`
  ${t?"pause(true);":""}
  function arm(m){
    function viewable(v){ pause(!v); }
    try { m.addEventListener("viewableChange", viewable); } catch(e){}
    try { m.addEventListener("audioVolumeChange", function(v){ mute(v === 0); }); } catch(e){}
    try { if (m.isViewable) viewable(m.isViewable()); } catch(e){ pause(false); }
  }
  (function wait(n){
    var m = window.mraid;
    if (m) {
      try { if (m.getState && m.getState() === "loading") { m.addEventListener("ready", function(){ arm(m); }); return; } } catch(e){}
      return arm(m);
    }
    if (n > 40) return pause(false); // no MRAID container (local test): just run
    setTimeout(function(){ wait(n + 1); }, 50);
  })(0);`,U={applovin:{label:"AppLovin",pkg:"html",limit:5*1024*1024,orientation:"both",tags:()=>'<script src="mraid.js"><\/script>',bridge:(e,t)=>P(`${L(e)}${ke(t,e)}
  window.__cta = function(url){
    if (!guard()) return;
    window.__track("cta");
    var dest = (typeof url === "string" && /^https?:/i.test(url)) ? url : storeUrl();
    try { if (window.mraid && mraid.open) { mraid.open(dest); return; } } catch(e){}
  };${H(e,!1)}${C("mraid")}`),notes:["Single HTML with every asset inside.","mraid.js is served by AppLovin; the tag 404s when you open the file locally, which is expected."],gameNotes:(e,t)=>{let n=W(t),i=Math.max(0,Math.floor(Number(t?.tapsToFinish)||0)),a=" AppLovin wants it only in playables with a real challenge: at least three interactions to finish, and no jump to the store within 5 seconds of the first tap.";return n==="off"?["Playable analytics off (PlaySpell Settings \u25B8 AppLovin analytics)."]:n==="auto"?["Playable analytics on, automatic: the challenge starts on the first tap and is solved "+(i?`after ${i} taps (25, 50 and 75% of them reported on the way), or when the game ends`:"when the game ends (GameEnded) or its end card shows")+(e?.gameEnd||e?.endCard||i?".":". No script ends the game or shows an end card, so it's never solved: set Taps to finish in PlaySpell Settings.")+a]:[e?.challenge?"Playable analytics on: AppLovin's reports show how far players get (loading, displayed, challenge started, 25/50/75%, solved or failed, retry, end card, CTA clicked)."+a:"Playable analytics off: no script reports a challenge solved or failed. Turn on PlaySpell Settings \u25B8 AppLovin analytics \u25B8 Automatic, or call PlaySpell.Analytics.ChallengeSolved() and ChallengeFailed() (or Luna's LevelWon and LevelFailed events)."]}},unity:{label:"Unity Ads",pkg:"html",limit:5*1024*1024,file:()=>"index.html",orientation:"both",tags:()=>"",bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.mraid && mraid.open) { mraid.open(storeUrl()); return; } } catch(e){}
  };${H(e,!0)}${C("mraid")}`),notes:["A single index.html. MRAID is injected by the ad: the game waits until the ad is viewable, pauses when hidden and follows the mute switch.","Store URLs are required."]},ironsource:{label:"ironSource",pkg:"html",limit:5*1024*1024,notice:{level:"warning",text:"ironSource Ads closed to new creatives on April 15, 2026, and direct demand ended on April 30. Upload to Unity Ads instead"},tags:()=>"",bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.dapi && dapi.openStoreUrl) { dapi.openStoreUrl(); return; } } catch(e){}
    try { if (window.mraid && mraid.open) { mraid.open(storeUrl()); return; } } catch(e){}
  };
  pause(true);
  (function wait(n){
    var d = window.dapi;
    if (!d) { if (n > 40) return pause(false); return setTimeout(function(){ wait(n + 1); }, 50); }
    function go(){
      try { d.addEventListener("viewableChange", function(e){ pause(!(e && e.isViewable)); }); } catch(e){}
      try { d.addEventListener("audioVolumeChange", function(v){ mute(!v); }); mute(!d.getAudioVolume()); } catch(e){}
      try { pause(!d.isViewable()); } catch(e){ pause(false); }
    }
    try { if (d.isReady()) go(); else d.addEventListener("ready", go); } catch(e){ pause(false); }
  })(0);${C("dapi")}`),notes:["DAPI (ironSource's playable API): starts when viewable, CTA through dapi.openStoreUrl()."]},facebook:{label:"Meta (Facebook)",pkg:"html",limit:2*1024*1024,tags:()=>"",bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.FbPlayableAd && FbPlayableAd.onCTAClick) { FbPlayableAd.onCTAClick(); return; } } catch(e){}
  };${C("fbplayable")}`),notes:["Single HTML, 2 MB limit. CTA through FbPlayableAd.onCTAClick()."]},moloco:{label:"Moloco",pkg:"html",limit:5*1024*1024,tags:()=>"",bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.FbPlayableAd && FbPlayableAd.onCTAClick) { FbPlayableAd.onCTAClick(); return; } } catch(e){}
  };${C("fbplayable")}`),notes:["Single HTML, never zipped. CTA through FbPlayableAd.onCTAClick(). The runtime makes no XMLHttpRequest."]},google:{label:"Google Ads",pkg:"zip",limit:5*1024*1024,tags:e=>`<meta name="ad.orientation" content="${e.orientation==="landscape"?"landscape":e.orientation==="portrait"?"portrait":"portrait,landscape"}">
<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"><\/script>`,bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.ExitApi && ExitApi.exit) { ExitApi.exit(); return; } } catch(e){}
  };${C("exitapi")}`),notes:["ZIP with index.html at the root. Upload under App campaigns (ExitApi)."]},mintegral:{label:"Mintegral",pkg:"zip",limit:5*1024*1024,entry:e=>`${e}/${e}.html`,needsGameEnd:"error",orientation:"both",tags:()=>"",bridge:e=>P(`${L(e)}
  var ended = false;
  window.__gameEnd = function(){
    if (ended) return; ended = true;
    try { if (typeof window.gameEnd === "function") window.gameEnd(); } catch(e){}
  };
  window.__cta = function(){
    if (!guard()) return;
    try { if (typeof window.install === "function") { window.install(); return; } } catch(e){}
  };
  if (typeof window.gameStart !== "function") window.gameStart = function(){ pause(false); };
  if (typeof window.gameClose !== "function") window.gameClose = function(){ pause(true); };
  window.__playspellReady = function(){ try { if (typeof window.gameReady === "function") window.gameReady(); } catch(e){} };${C("install")}`),notes:["The ZIP, its folder and the HTML share one name (letters, numbers, underscores). Call Playable.GameEnded() on win and lose: Mintegral rejects builds that never call gameEnd.","A CTA has to stay visible for the whole playable, and it has to play with a mouse in a PC browser, where Mintegral's test tool runs it."]},tiktok:{label:"TikTok / Pangle",pkg:"zip",limit:5*1024*1024,warnAt:3*1024*1024,tags:()=>"",bodyTags:()=>'<script src="https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js"><\/script>',bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (typeof window.openAppStore === "function") { window.openAppStore(); return; } } catch(e){}
  };${C("openappstore")}`),extraFiles:e=>[{path:"config.json",text:JSON.stringify({playable_orientation:e.orientation==="portrait"?1:e.orientation==="landscape"?2:0},null,2)}],notes:["ZIP with index.html and config.json. Upload it with a video or image, as TikTok pairs playables with one."]},vungle:{label:"Liftoff (Vungle)",pkg:"zip",limit:5*1024*1024,needsGameEnd:"warning",tags:()=>"",bridge:e=>P(`${L(e)}
  // 'complete' opens the store by itself, so it and 'download' may never come together. Liftoff's verifier
  // looks for these calls as written, so they stay literal.
  var lastCall = 0, completed = false;
  function together(){ return Date.now() - lastCall < 1500; }
  window.__cta = function(){
    if (!guard() || together()) return;
    lastCall = Date.now();
    parent.postMessage('download','*');
  };
  window.__gameEnd = function(){
    if (completed || together()) return;
    completed = true; lastCall = Date.now();
    parent.postMessage('complete','*');
  };
  addEventListener("message", function(e){
    if (e.data === "ad-event-pause") pause(true);
    if (e.data === "ad-event-resume") pause(false);
  });${C("vungle")}`),notes:["ZIP with index.html. CTA sends 'download'; GameEnded sends 'complete', which opens the store by itself, so call it when the game has really ended."]},adcolony:{label:"AdColony / generic MRAID",pkg:"html",limit:5*1024*1024,tags:()=>'<script src="mraid.js"><\/script>',bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.mraid && mraid.open) { mraid.open(storeUrl()); return; } } catch(e){}
  };${H(e,!0)}${C("mraid")}`),notes:["Any MRAID 2.0 network (AdColony, Chartboost, InMobi, Digital Turbine\u2026)."]},snapchat:{label:"Snapchat",pkg:"zip",limit:5*1024*1024,orientation:"portrait",tags:()=>"",bridge:e=>P(`${L(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.ScPlayableAd && ScPlayableAd.onCTAClick) { ScPlayableAd.onCTAClick(); return; } } catch(e){}
  };${C("scplayable")}`),extraFiles:()=>[{path:"config.json",text:JSON.stringify({playable_orientation:1,orientation:1},null,2)}],notes:["ZIP with index.html and config.json, portrait only, no MRAID. CTA through ScPlayableAd.onCTAClick(); the store comes from the campaign."]}},G=Object.keys(U),Q=e=>P(`${L(e)}
  if (!window.__cta) window.__cta = function(){
    var el = document.getElementById("playspell-preview-note");
    if (!el) { el = document.createElement("div"); el.id = "playspell-preview-note"; el.style.cssText = "position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99;font:600 13px system-ui;background:#111c;color:#fff;padding:8px 14px;border-radius:6px;pointer-events:none"; document.body.appendChild(el); }
    el.textContent = "Install tapped: the real ad opens the store here"; el.style.display = "block";
    clearTimeout(el.t); el.t = setTimeout(function(){ el.style.display = "none"; }, 2200);
  };${C(null)}`);var _e=new TextDecoder,F=new TextEncoder,$=e=>_e.decode(e).replace(/^\uFEFF/,""),R=1048576;async function ie(e,t){return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())}async function ae(e){let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n=new Map,i=e.length-22,a=Math.max(0,e.length-65557);for(;i>=a&&t.getUint32(i,!0)!==101010256;)i--;if(i<a)throw new Error("This isn't a ZIP file, or it's damaged.");let s=t.getUint32(i+16,!0);for(let u=0,f=t.getUint16(i+10,!0);u<f;u++){if(t.getUint32(s,!0)!==33639248)throw new Error("The ZIP file is damaged.");let h=t.getUint16(s+8,!0),l=t.getUint16(s+10,!0),g=t.getUint32(s+20,!0),o=t.getUint16(s+28,!0),p=t.getUint16(s+30,!0),r=t.getUint16(s+32,!0),m=t.getUint32(s+42,!0),c=oe($(e.subarray(s+46,s+46+o)));if(s+=46+o+p+r,!c||c.endsWith("/")||Ae(c))continue;if(h&1)throw new Error("The ZIP file has a password. Make it again without one.");let E=m+30+t.getUint16(m+26,!0)+t.getUint16(m+28,!0),S=e.subarray(E,E+g);if(l===0)n.set(c,S.slice());else if(l===8)n.set(c,await ie(S,new DecompressionStream("deflate-raw")));else throw new Error(`${c} is packed in a way browsers can't open (method ${l}). Make the ZIP again with your system's own zip.`)}return n}var oe=e=>e.replace(/\\/g,"/").replace(/^\.?\//,""),Ae=e=>/(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$|\.git\/)/i.test(e),xe=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t++){let n=t;for(let i=0;i<8;i++)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),Ee=e=>{let t=4294967295;for(let n=0;n<e.length;n++)t=xe[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0};async function re(e){let t=[],n=[],i=0,a=new Date,s=a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1,u=a.getFullYear()-1980<<9|a.getMonth()+1<<5|a.getDate();for(let l of e){let g=F.encode(l.path),o=l.bytes??F.encode(l.text??""),p=await ie(o,new CompressionStream("deflate-raw")),r=p.length<o.length,m=r?p:o,c=Ee(o),E=new DataView(new ArrayBuffer(30));[[0,67324752,4],[4,20,2],[6,2048,2],[8,r?8:0,2],[10,s,2],[12,u,2],[14,c,4],[18,m.length,4],[22,o.length,4],[26,g.length,2],[28,0,2]].forEach(([T,O,D])=>D===4?E.setUint32(T,O,!0):E.setUint16(T,O,!0)),t.push(new Uint8Array(E.buffer),g,m);let S=new DataView(new ArrayBuffer(46));[[0,33639248,4],[4,20,2],[6,20,2],[8,2048,2],[10,r?8:0,2],[12,s,2],[14,u,2],[16,c,4],[20,m.length,4],[24,o.length,4],[28,g.length,2],[42,i,4]].forEach(([T,O,D])=>D===4?S.setUint32(T,O,!0):S.setUint16(T,O,!0)),n.push(new Uint8Array(S.buffer),g),i+=30+g.length+m.length}let f=n.reduce((l,g)=>l+g.length,0),h=new DataView(new ArrayBuffer(22));return h.setUint32(0,101010256,!0),h.setUint16(8,e.length,!0),h.setUint16(10,e.length,!0),h.setUint32(12,f,!0),h.setUint32(16,i,!0),Se([...t,...n,new Uint8Array(h.buffer)])}function Se(e){let t=new Uint8Array(e.reduce((i,a)=>i+a.length,0)),n=0;for(let i of e)t.set(i,n),n+=i.length;return t}function Le(e){let t=[...e.keys()].filter(s=>/\.html?$/i.test(s));if(!t.length)throw new Error("There's no HTML page in this ZIP.");let n=s=>s.split("/").length,i=t.filter(s=>/(^|\/)index\.html?$/i.test(s)).sort((s,u)=>n(s)-n(u))[0];if(i)return i;let a=t.find(s=>{let u=s.split("/");return u.length===2&&u[1].replace(/\.html?$/i,"")===u[0]});return a||t.sort((s,u)=>n(s)-n(u)||e.get(u).length-e.get(s).length)[0]}async function Ce(e,t){let n=t[0]===80&&t[1]===75,i,a;if(n)i=await ae(t),a=Le(i);else{if(!/\.html?$/i.test(e)&&!/<(html|head|body|script|canvas)[\s>]/i.test($(t.subarray(0,4096))))throw new Error("Drop an HTML file or a ZIP.");a=oe(e.split(/[\\/]/).pop()||"index.html"),i=new Map([[a,t]])}return{name:e,stem:se(e,i.get(a)),kind:n?"zip":"html",files:i,entry:a,html:$(i.get(a)),size:t.length}}function se(e,t){let n=String(e).split(/[\\/]/).pop().replace(/\.(html?|zip)$/i,"").replace(new RegExp("[_ .-]("+G.join("|")+"|ironsrc|meta|fb|pangle|liftoff|mraid)$","i"),"");return/^index$/i.test(n)&&t&&(n=(/<title>([^<]*)<\/title>/i.exec($(t))||[])[1]||n),n.replace(/[^A-Za-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"playable"}var ee=[{id:"playspell",label:"PlaySpell",re:/id="playspell-payload"/},{id:"mintegral",label:"Mintegral",re:/\bgameReady\s*\(|\bwindow\.install\s*\(|\bwindow\.gameEnd\b/,call:"install()"},{id:"vungle",label:"Liftoff (Vungle)",re:/postMessage\(\s*["'](?:download|complete)["']/,call:"__cta()"},{id:"google",label:"Google Ads",re:/exitapi\.js|\bExitApi\.exit\b/,call:"ExitApi.exit()"},{id:"tiktok",label:"TikTok / Pangle",re:/playable-sdk\.js|\bopenAppStore\s*\(/,call:"openAppStore()"},{id:"snapchat",label:"Snapchat",re:/\bScPlayableAd\b/,call:"ScPlayableAd.onCTAClick()"},{id:"facebook",label:"Meta / Moloco",re:/\bFbPlayableAd\b/,call:"FbPlayableAd.onCTAClick()"},{id:"ironsource",label:"ironSource",re:/\bdapi\.(?:openStoreUrl|isReady|addEventListener)\b/,call:"dapi.openStoreUrl()"},{id:"mraid",label:"MRAID (AppLovin, Unity Ads\u2026)",re:/mraid\.js|\bmraid\.(?:open|addEventListener|getState|isViewable)\b/,call:"mraid.open(URL)"},{id:"open",label:"a web page",re:/\bwindow\.open\s*\(/,call:"window.open(URL)"}],te={applovin:"mraid",unity:"mraid",adcolony:"mraid",mraid:"mraid",ironsource:"ironsource",facebook:"facebook",moloco:"facebook",google:"google",mintegral:"mintegral",tiktok:"tiktok",pangle:"tiktok",vungle:"vungle",liftoff:"vungle",snapchat:"snapchat"};function le(e){let t=de(e),n=ee.filter(o=>o.re.test(t)),i=/window\.\$environment\s*=|id=["']?LUNA_PLAYGROUND_BUNDLES/.test(e.html),a=i?(/targetPlatform:\s*["'](\w+)["']/.exec(e.html)?.[1]??"").toLowerCase():"";i&&te[a]&&(n=ee.filter(o=>o.id===te[a]||o.id==="open"&&n.includes(o)));let s=/https?:\/\/(?:apps|itunes)\.apple\.com\/[^\s"'<>\\)`,;]+/i.exec(t)?.[0]??"",u=/https?:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+/i.exec(t)?.[0]??(/market:\/\/details\?id=([\w.]+)/i.exec(t)?"https://play.google.com/store/apps/details?id="+/market:\/\/details\?id=([\w.]+)/i.exec(t)[1]:""),f=/var IOS = ("(?:[^"\\]|\\.)*"), AND = ("(?:[^"\\]|\\.)*")/.exec(e.html),h=/<meta\s+name=["']ad\.orientation["']\s+content=["']([^"']*)["']/i.exec(e.html)?.[1]??"",l=/portrait/.test(h)&&/landscape/.test(h)?"both":/portrait/.test(h)?"portrait":/landscape/.test(h)?"landscape":"both",g=[...e.files.keys()].find(o=>/(^|\/)config\.json$/i.test(o));if(g)try{let o=JSON.parse($(e.files.get(g))).playable_orientation;o===1&&(l="portrait"),o===2&&(l="landscape")}catch{}return{made:n.map(o=>o.id),madeFor:n.some(o=>o.id==="playspell")?["PlaySpell"]:i?["Luna Playground, for "+(U[a]?.label??(a||"an unnamed network"))]:n.filter(o=>o.id!=="open").map(o=>o.label),luna:i,offline:/collector\.lunalabs\.io|lunalabs\.io\/api/.test(t)?["lunalabs.io"]:[],playspell:n.some(o=>o.id==="playspell"),calls:n.filter(o=>o.call).map(o=>o.call),ios:f&&JSON.parse(f[1])||s,android:f&&JSON.parse(f[2])||u,title:(/<title>([^<]*)<\/title>/i.exec(e.html)?.[1]??"").trim()||e.stem,orientation:l,ends:/\bgameEnd\s*\(|postMessage\(\s*["']complete["']|\bGameEnded\s*\(|__gameEnd/.test(t)||n.some(o=>o.id==="playspell"),readies:/\bgameReady\s*\(/.test(t)}}function de(e){let t=e.html;for(let[n,i]of e.files)/\.(m?js|css|json|html?)$/i.test(n)&&n!==e.entry&&(t+=`
`+$(i));return t}var Pe={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",avif:"image/avif",svg:"image/svg+xml",ico:"image/x-icon",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",oga:"audio/ogg",m4a:"audio/mp4",aac:"audio/aac",mp4:"video/mp4",webm:"video/webm",m4v:"video/mp4",js:"text/javascript",mjs:"text/javascript",css:"text/css",json:"application/json",html:"text/html",htm:"text/html",txt:"text/plain",xml:"application/xml",atlas:"text/plain",fnt:"text/plain",plist:"application/xml",csv:"text/csv",glsl:"text/plain",vert:"text/plain",frag:"text/plain",woff:"font/woff",woff2:"font/woff2",ttf:"font/ttf",otf:"font/otf",wasm:"application/wasm",glb:"model/gltf-binary",gltf:"model/gltf+json",bin:"application/octet-stream",ktx:"image/ktx",ktx2:"image/ktx2",basis:"application/octet-stream"},ce=e=>Pe[(/\.([a-z0-9]+)$/i.exec(e)?.[1]??"").toLowerCase()]??"application/octet-stream";function pe(e){let t="";for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode.apply(null,e.subarray(n,n+32768));return btoa(t)}var ne=(e,t)=>`data:${ce(e)};base64,${pe(t)}`,V=e=>e.slice(0,e.lastIndexOf("/")+1);function $e(e){let t=[];for(let n of e.split("/"))n===".."?t.pop():n&&n!=="."&&t.push(n);return t.join("/")}function Te(e){let t=new Map([...e.keys()].map(n=>[n.toLowerCase(),n]));return(n,i)=>{if(n=String(n??"").trim(),!n||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(n))return null;let a=n.split(/[?#]/)[0];try{a=decodeURIComponent(a)}catch{}return a=$e(a.startsWith("/")?a:i+a),e.has(a)?a:t.get(a.toLowerCase())??null}}var q=e=>{let t=[];for(let n of String(e).matchAll(/([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g))t.push({name:n[1].toLowerCase(),raw:n[0],value:n[2]??n[3]??n[4]??""});return t},Me=/(^|\/)(mraid|dapi)\.js$|exitapi\.js$|playable-sdk\.js$|\/mintegral[^/]*\.js$|playturbo|mindworks-creative/i,B=e=>e.replace(/(?:window\.)?(?:parent|top)\.postMessage\(\s*(["'])download\1\s*,\s*(["'])\*\2\s*\)/g,"window.__cta()").replace(/(?:window\.)?(?:parent|top)\.postMessage\(\s*(["'])complete\1\s*,\s*(["'])\*\2\s*\)/g,"window.__gameEnd()"),Z="<!--ps:before-game-->",je=e=>e.replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--");function Re(e){let t=le(e),n=e.files,i=Te(n),a=V(e.entry),s=[],u=[],f=new Set([e.entry]),h=new Set,l=new Set,g=new Set,o=new Set,p=(d,b,k=new Set)=>d.replace(/@import\s+(?:url\(\s*)?(["']?)([^"')\s;]+)\1\s*\)?\s*;/gi,(y,_,v)=>{let w=i(v,b);return!w||k.has(w)?y:(f.add(w),k.add(w),p($(n.get(w)),V(w),k))}).replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(y,_,v)=>{let w=i(v,b);return w?(f.add(w),h.add(w),`url(${ne(w,n.get(w))})`):(/^(https?:)?\/\//i.test(v.trim())&&l.add(v.trim()),y)}),r=e.html,m;do m="psScript"+Math.random().toString(36).slice(2,10);while(r.includes(m));let c=d=>m+d+m,E=[],S=[],T=!1;if(r=r.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(d,b,k)=>{let y=q(b),_=y.find(x=>x.name==="src"),v=y.find(x=>x.name==="type")?.value.toLowerCase()??"",w=y.filter(x=>!["src","integrity","crossorigin","async","defer","charset","nonce"].includes(x.name)).map(x=>" "+x.raw).join(""),A;if(_){let x=_.value;if(Me.test(x.split(/[?#]/)[0]))s.push(`Took out ${x.split("/").pop()}: each network's file gets its own`),A="";else{let j=i(x,a);if(j){f.add(j);let M=$(n.get(j));v==="module"&&/(?:^|[;\s}])import\s*(?:[\w*{$][^'"]*?from\s*)?["']\.{0,2}\/|\bimport\(\s*["']\.{0,2}\//.test(M)&&o.add(j),A=`<script${w}>${je(B(M))}<\/script>`,(y.some(fe=>fe.name==="defer")||v==="module")&&(S.push(A),A="")}else/^(https?:)?\/\//i.test(x)?l.add(x):g.add(x),A=d}}else if(/^\s*\(function\(\)\{\s*var IOS = /.test(k)&&/__playspellPaused/.test(k))A="";else{if(v&&!/javascript|module|^text\/babel$/.test(v))return A=d,E.push(A),c(E.length-1);A=`<script${b}>${B(k)}<\/script>`}return A&&!T&&(A=Z+A,T=!0),E.push(A),c(E.length-1)}),r=r.replace(/<link\b([^>]*)>/gi,(d,b)=>{let k=q(b),y=k.find(w=>w.name==="rel")?.value.toLowerCase()??"",_=k.find(w=>w.name==="href")?.value??"",v=i(_,a);if(/stylesheet/.test(y)){if(!v)return/^(https?:)?\/\//i.test(_)?l.add(_):_&&g.add(_),d;f.add(v);let w=k.find(A=>A.name==="media");return`<style${w?" "+w.raw:""}>${p($(n.get(v)),V(v)).replace(/<\/style/gi,"<\\/style")}</style>`}return v&&/icon|preload|prefetch|modulepreload|manifest/.test(y)||/^(https?:)?\/\//i.test(_)&&/preconnect|dns-prefetch/.test(y)?"":(/^(https?:)?\/\//i.test(_)&&l.add(_),d)}),r=r.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(d,b,k,y)=>b+p(k,a)+y),r=r.replace(/(\sstyle\s*=\s*)("([^"]*)"|'([^']*)')/gi,(d,b,k,y,_)=>{let v=y??_,w=p(v,a);return w===v?d:b+(y!==void 0?`"${w}"`:`'${w}'`)}),r=r.replace(/<([a-zA-Z][\w-]*)\b([^>]*)>/g,(d,b,k)=>{if(!/\s(?:src|href|poster|data-src|xlink:href)\s*=/i.test(k))return d;let y=b.toLowerCase()==="a";return"<"+b+k.replace(/(\s(?:src|href|poster|data-src|xlink:href)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi,(_,v,w,A,x)=>{let j=w??A??x,M=i(j,a);return M?y||/\.html?$/i.test(M)?_:(f.add(M),h.add(M),v+`"${ne(M,n.get(M))}"`):(!y&&/^(https?:)?\/\//i.test(j)&&l.add(j),_)})+">"}),r=r.replace(/<meta\s+name=["']ad\.(?:orientation|size)["'][^>]*>\s*/gi,"").replace(/<meta\s+charset\s*=\s*["']?[^"'>\s]*["']?\s*\/?>\s*/gi,"").replace(/<meta\s+http-equiv=["']content-type["'][^>]*>\s*/gi,"").replace(/^\uFEFF?\s*(<!--[\s\S]*?-->\s*)*<!doctype[^>]*>\s*/i,""),r=r.replace(new RegExp(m+"(\\d+)"+m,"g"),(d,b)=>E[b]),S.length&&!T&&(S[0]=Z+S[0],T=!0),S.length){let d=r.search(/<\/body>/i);r=d<0?r+S.join(`
`):r.slice(0,d)+S.join(`
`)+`
`+r.slice(d)}/<head[\s>]/i.test(r)||(r=/<html[^>]*>/i.test(r)?r.replace(/<html[^>]*>/i,d=>d+"<head></head>"):"<head></head>"+r),/<html[\s>]/i.test(r)||(r="<html>"+r+"</html>"),r=`<!DOCTYPE html>
`+r;let O=r.replace(/data:[^;,"')\s]+;base64,[A-Za-z0-9+/=]+/g,""),D={},X=0,I=[];for(let[d,b]of n){if(f.has(d)&&!h.has(d))continue;if(/\.(map|md|psd|ts|scss|less)$/i.test(d)||/(^|\/)(readme|license|changelog)[^/]*$/i.test(d)){I.push(d);continue}if(/(^|\/)config\.json$/i.test(d)&&/playable_orientation/.test($(b)))continue;if(/\.html?$/i.test(d)&&d!==e.entry){I.push(d);continue}let k=d.split("/").pop();if(h.has(d)&&!O.includes(k))continue;let y=d.startsWith(a)?d.slice(a.length):d;D[y]=[ce(d),pe(/\.m?js$/i.test(d)?F.encode(B($(b))):b)],X+=b.length}let N=Object.keys(D).length;e.kind==="zip"&&s.push(`${n.size} files in the ZIP; ${f.size} went into the page${N?`, and ${N} more the game loads by itself are packed in with it`:""}`),t.offline.length&&s.push(`${t.luna?"Luna's analytics":"Its analytics"} (${t.offline.join(", ")}) get their answers inside each file, as ad networks block calls to the internet. These files report nothing to ${t.luna?"Luna's":"that"} dashboard`),I.length&&s.push("Left out, as no game needs them: "+I.slice(0,6).join(", ")+(I.length>6?` and ${I.length-6} more`:""));for(let d of l)u.push(`Loads ${d} from the internet. Ad networks block that: put the file in the ZIP and link to it there`);for(let d of o)u.push(`${d} imports other code files (JavaScript modules), which a one-file ad can't do. Build the game into one script, without code splitting, and drop it again`);for(let d of g)u.push(`The page asks for ${d}, which isn't in the ${e.kind==="zip"?"ZIP":"upload. Drop a ZIP of the page with its files instead"}`);return!t.calls.length&&!t.playspell&&u.push("No install button found: the game calls none of the networks' store APIs (mraid.open, ExitApi.exit, FbPlayableAd.onCTAClick, window.open\u2026), so no network can open the store from it"),{page:r,vfs:N?D:null,vfsBytes:X,usesXhr:/XMLHttpRequest/.test(de(e)),info:t,notes:s,problems:u,stem:e.stem,source:e}}function Oe(e){let t=[];for(let n of e.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g))if(n[1].toLowerCase()!=="a")for(let i of q(n[2]))["src","href","poster","data-src"].includes(i.name)&&/^(https?:)?\/\//i.test(i.value)&&t.push(i.value);return t}var De=e=>`(function(){
  var el = document.getElementById("ps-files"); if (!el) return;
  var F = JSON.parse(el.textContent), keys = Object.keys(F), made = {};
  el.parentNode.removeChild(el);
  function bytes(k){ var b = atob(F[k][1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function url(k){ return made[k] || (made[k] = URL.createObjectURL(new Blob([bytes(k)], { type: F[k][0] }))); }
  var here = String(document.URL).split(/[?#]/)[0]; here = here.slice(0, here.lastIndexOf("/") + 1);
  function norm(p){ var o = []; p.split("/").forEach(function(s){ if (s === "..") o.pop(); else if (s && s !== ".") o.push(s); }); return o.join("/"); }
  function find(u){
    if (u && typeof u === "object") u = u.url || u.href || String(u);
    if (typeof u !== "string" || /^(data|blob):/i.test(u)) return null;
    var p = u.split(/[?#]/)[0];
    if (here && p.indexOf(here) === 0) p = p.slice(here.length);
    p = p.replace(/^[a-z][a-z0-9+.-]*:\\/\\/[^\\/]*/i, "").replace(/^\\/\\/[^\\/]*/, "");
    try { p = decodeURIComponent(p); } catch(e){}
    p = norm(p);
    if (F.hasOwnProperty(p)) return p;
    var best = null;
    for (var i = 0; i < keys.length; i++) { var k = keys[i]; if (p.length > k.length && p.slice(-k.length - 1) === "/" + k && (!best || k.length > best.length)) best = k; }
    return best;
  }
  window.__psFile = function(u){ var k = find(u); return k ? url(k) : null; };
  if (window.fetch) { var f = window.fetch; window.fetch = function(input){ var k = find(input); if (k) return Promise.resolve(new Response(new Blob([bytes(k)], { type: F[k][0] }), { status: 200, headers: { "Content-Type": F[k][0] } })); return f.apply(this, arguments); }; }
  ${e?"var X = window.XMLHttpRequest; if (X) { var open = X.prototype.open; X.prototype.open = function(m, u){ var k = find(u), a = Array.prototype.slice.call(arguments); if (k) a[1] = url(k); return open.apply(this, a); }; }":""}
  function hook(C, prop){ if (!C) return; var d = Object.getOwnPropertyDescriptor(C.prototype, prop); if (!d || !d.set) return;
    Object.defineProperty(C.prototype, prop, { configurable: true, enumerable: d.enumerable, get: d.get, set: function(v){ var k = find(String(v)); d.set.call(this, k ? url(k) : v); } }); }
  hook(window.HTMLImageElement, "src"); hook(window.HTMLMediaElement, "src"); hook(window.HTMLSourceElement, "src"); hook(window.HTMLScriptElement, "src"); hook(window.HTMLLinkElement, "href");
  var sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(n, v){ if (/^(src|href|xlink:href)$/i.test(n)) { var k = find(String(v)); if (k) v = url(k); } return sa.call(this, n, v); };
  if (window.Audio) { var A = window.Audio, Au = function(s){ var a = new A(); if (s !== undefined) a.src = s; return a; }; Au.prototype = A.prototype; window.Audio = Au; }
  if (window.Worker) { var W = window.Worker, Wo = function(u, o){ var k = find(String(u)); return new W(k ? url(k) : u, o); }; Wo.prototype = W.prototype; window.Worker = Wo; }
})();`,Ue=e=>`(function(){
  var H = ${JSON.stringify(e)};
  function ours(u){ try { var h = new URL(String(u && u.url || u), document.URL).hostname; return H.some(function(x){ return h === x || h.slice(-x.length - 1) === "." + x; }); } catch(e){ return false; } }
  if (window.fetch) { var f = window.fetch; window.fetch = function(input){ if (ours(input)) return Promise.resolve(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })); return f.apply(this, arguments); }; }
  if (navigator.sendBeacon) { var b = navigator.sendBeacon; navigator.sendBeacon = function(u){ return ours(u) ? true : b.apply(navigator, arguments); }; }
})();`,Ie=`(function(){
  if (window.PlaySpell && window.PlaySpell.setPaused) return;
  // a page that shows its own loading screen first (the share page) says so before the game starts
  var held = !!window.__playspellPaused, muted = false, frames = 0, seq = 0, parked = {}, live = {};
  var raf = window.requestAnimationFrame && window.requestAnimationFrame.bind(window), caf = window.cancelAnimationFrame && window.cancelAnimationFrame.bind(window);
  function run(id, cb){ live[id] = raf(function(t){ delete live[id]; if (held) { parked[id] = cb; return; } frames++; cb(t); }); }
  if (raf) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame = function(cb){ var id = ++seq; if (held) parked[id] = cb; else run(id, cb); return id; };
    window.cancelAnimationFrame = window.webkitCancelAnimationFrame = function(id){ delete parked[id]; if (live[id] !== undefined) { caf(live[id]); delete live[id]; } };
  }
  function quiet(){ return held || muted; }
  var contexts = [], media = [];
  ["AudioContext", "webkitAudioContext"].forEach(function(n){
    var A = window[n]; if (!A || A.__ps) return;
    var W = function(o){ var c = arguments.length ? new A(o) : new A(); keep(c); return c; };
    W.prototype = A.prototype; W.__ps = true; try { Object.setPrototypeOf(W, A); } catch(e){}
    window[n] = W;
  });
  function keep(c){
    contexts.push(c);
    var resume = c.resume, suspend = c.suspend;
    c.resume = function(){ if (quiet()) { c.__psWant = true; return Promise.resolve(); } return resume.apply(c, arguments); };
    c.suspend = function(){ c.__psWant = false; return suspend.apply(c, arguments); };
    c.__psResume = function(){ try { var p = resume.call(c); if (p && p.catch) p.catch(function(){}); } catch(e){} };
    c.__psSuspend = function(){ try { var p = suspend.call(c); if (p && p.catch) p.catch(function(){}); } catch(e){} };
    if (quiet()) { c.__psWant = true; c.__psSuspend(); }
  }
  var M = window.HTMLMediaElement, play = M && M.prototype.play;
  if (play) M.prototype.play = function(){ if (media.indexOf(this) < 0) media.push(this); if (quiet()) { this.__psWant = true; return Promise.resolve(); } return play.apply(this, arguments); };
  function sound(){
    var q = quiet();
    contexts.forEach(function(c){
      if (q) { if (c.state === "running") { c.__psWant = true; c.__psSuspend(); } }
      else if (c.__psWant) { c.__psWant = false; c.__psResume(); }
    });
    media.forEach(function(m){
      try {
        if (q) { if (!m.paused) { m.__psWant = true; m.pause(); } }
        else if (m.__psWant) { m.__psWant = false; var p = play.call(m); if (p && p.catch) p.catch(function(){}); }
      } catch(e){}
    });
  }
  window.PlaySpell = window.PlaySpell || {};
  window.PlaySpell.setPaused = function(p){
    p = !!p; if (p === held) return; held = p;
    if (!held) { var ids = Object.keys(parked), was = parked; parked = {}; ids.forEach(function(id){ run(id, was[id]); }); }
    sound();
  };
  window.PlaySpell.setMuted = function(m){ muted = !!m; sound(); };
  window.__psGame = function(){ return { held: held, muted: muted, frames: frames }; };
})();`,Fe=(e,t)=>{let n="";return e==="mintegral"?(n+=`var names = ["install", "gameEnd", "gameReady"], mine = {};
  window.__psKeep = function(){ names.forEach(function(k){ if (!mine[k] && typeof window[k] === "function") mine[k] = window[k]; }); };
  window.__psKeep();
  addEventListener("load", function(){
    names.forEach(function(k){ if (typeof mine[k] === "function" && window[k] !== mine[k]) window[k] = mine[k]; });
    ${t.ends?"":'if (typeof window.install === "function") { var i = window.install; window.install = function(){ try { window.__gameEnd(); } catch(e){} return i.apply(this, arguments); }; }'}
  });
  `,t.ends||(n+="var cta = window.__cta; window.__cta = function(u){ try { window.__gameEnd(); } catch(e){} return cta(u); };"),t.readies||(n+='addEventListener("load", function(){ setTimeout(function(){ if (window.__playspellReady) window.__playspellReady(); }, 0); });'),n+=`addEventListener("load", function(){
    var start = window.gameStart, close = window.gameClose;
    window.gameStart = function(){ window.__playspellPause(false); if (typeof start === "function") return start.apply(this, arguments); };
    window.gameClose = function(){ window.__playspellPause(true); if (typeof close === "function") return close.apply(this, arguments); };
  });`):t.made.includes("mintegral")&&(n+=`if (typeof window.gameReady !== "function") window.gameReady = function(){};
  if (typeof window.gameEnd !== "function") window.gameEnd = function(){ window.__gameEnd(); };
  addEventListener("load", function(){ setTimeout(function(){ if (typeof window.gameStart === "function") try { window.gameStart(); } catch(e){} }, 0); });`),t.luna&&(n+=`
  addEventListener("luna:ended", function(){ try { window.__gameEnd(); } catch(e){} });`),e==="preview"&&(n+=`
  addEventListener("load", function(){ setTimeout(function(){ if (window.__playspellReady) try { window.__playspellReady(); } catch(e){} }, 0); });`),n?`<script>
(function(){
  ${n}
})();
<\/script>`:""},Ne={label:"Preview",pkg:"html",tags:()=>"",bridge:Q};function ue(e,t,n={}){let i=t==="preview"?Ne:U[t];if(!i)throw new Error("No network called "+t);let a={title:n.title||e.info.title,ios:n.ios??e.info.ios,android:n.android??e.info.android,orientation:n.orientation||e.info.orientation,analytics:"off"},s=!e.info.playspell,u=!!e.vfs&&e.usesXhr,f=e.page,h="width=device-width,initial-scale=1";f=f.replace(/<meta\s+name=["']viewport["']\s+content=["']([^"']*)["'][^>]*>\s*/i,(c,E)=>(h=E,""));let l=h.split(/[,;]/).map(c=>c.trim()).filter(Boolean).filter(c=>!/^(user-scalable|maximum-scale|minimum-scale)\s*=/i.test(c));l.some(c=>/^width\s*=/i.test(c))||l.unshift("width=device-width"),l.some(c=>/^initial-scale\s*=/i.test(c))||l.push("initial-scale=1"),l.push("maximum-scale=1","user-scalable=no");let g=`<meta charset="utf-8">
<meta name="viewport" content="${l.join(",").replace(/"/g,"")}">
`+(i.tags(a)?i.tags(a)+`
`:"")+(e.info.offline.length?`<script>${Ue(e.info.offline)}<\/script>
`:"")+(e.vfs?`<script type="application/json" id="ps-files">${JSON.stringify(e.vfs).replace(/</g,"\\u003c")}<\/script>
<script>${De(u)}<\/script>
`:"")+(s?`<script>${Ie}<\/script>
`:"")+i.bridge(a,{})+`
`+(s?Fe(t,e.info):""),o=f.replace(/<head\b[^>]*>/i,c=>c+`
`+g).replace(Z,s&&t==="mintegral"?"<script>window.__psKeep && window.__psKeep();<\/script>":""),p=i.bodyTags?.(a)??"";p&&(o=/<body\b[^>]*>/i.test(o)?o.replace(/<body\b[^>]*>/i,c=>c+`
`+p):o.replace(/<\/head>/i,c=>c+`
<body>
`+p));let r=`${n.stem||e.stem}_${t}`;if(i.pkg==="zip"){let c=i.entry?i.entry(r):"index.html";return{network:t,label:i.label,pkg:"zip",name:r+".zip",entry:c,html:o,files:[{path:c,text:o},...i.extraFiles?i.extraFiles(a):[]],cfg:a,tags:i.tags(a)+p}}let m=i.file?i.file(r):r+".html";return{network:t,label:i.label,pkg:"html",name:m,entry:m,html:o,files:[{path:m,text:o}],cfg:a,tags:i.tags(a)+p}}async function ze(e){return{name:e.name,bytes:e.pkg==="zip"?await re(e.files):F.encode(e.html)}}function He(e,t,n){let i=U[e.network],a=[],s=[],u=e.network==="facebook"?2*R:i.limit||5*R;n>u?a.push(`${(n/R).toFixed(2)} MB is over ${i.label}'s ${u/R} MB limit`):i.warnAt&&n>i.warnAt&&s.push(`${(n/R).toFixed(2)} MB; ${i.label} recommends under ${i.warnAt/R} MB`),i.notice&&s.push(i.notice.text);let f=e.html.replace(/<script id="playspell-payload"[\s\S]*?<\/script>/,"").replace(/<script type="application\/json" id="ps-files">[\s\S]*?<\/script>/,"");for(let p of new Set(Oe(f)))!e.tags.includes(p)&&!t.problems.some(r=>r.includes(p))&&a.push(`Loads ${p} from the internet; ${i.label} only takes files that hold everything`);let h=J[e.network],l=f+(e.files.find(p=>p.path==="config.json")?.text??""),g=f.search(/<\/head>/i);for(let p of h.has||[])l.includes(p)||a.push("Missing "+p);h.noMraid&&/<script\b[^>]*\bsrc\s*=\s*["'][^"']*mraid\.js/i.test(f)&&a.push(`Must not load mraid.js: ${i.label} has no MRAID`);for(let p of h.head||[])(f.indexOf(p)<0||f.indexOf(p)>g)&&a.push(p+" has to be in <head>");for(let p of h.body||[])f.indexOf(p)<g&&a.push(p+" has to be in <body>");if(/^<!DOCTYPE html>/.test(e.html)||a.push("No <!DOCTYPE html>"),/<meta charset="utf-8">/i.test(e.html.slice(0,1024))||a.push("No UTF-8 charset at the top"),/<meta name="viewport" content="[^"]*user-scalable=no/.test(e.html.slice(0,2048))||a.push("The page can be zoomed: Mintegral turns that down"),e.network==="mintegral"&&!/^[A-Za-z0-9_]+\.zip$/.test(e.name)&&a.push("Mintegral's names may only use letters, numbers and underscores"),e.pkg==="zip"){let p=e.network==="mintegral"?[e.entry]:["index.html",...["tiktok","snapchat"].includes(e.network)?["config.json"]:[]],r=e.files.map(c=>c.path);p.slice().sort().join()!==r.slice().sort().join()&&a.push(`The ZIP should hold ${p.join(", ")}; it holds ${r.join(", ")}`);let m=e.files.find(c=>c.path==="config.json");if(m)try{JSON.parse(m.text)}catch{a.push("config.json isn't valid JSON")}}return e.network==="moloco"&&/XMLHttpRequest/.test(f)&&a.push("The game's code has XMLHttpRequest in it, and Moloco rejects files that do"),/(?:^|[^.\w$])(?:window\.|top\.|self\.|parent\.)?location(?:\.href)?\s*=(?!=)|\blocation\.(?:assign|replace)\s*\(/.test(f)&&s.push("The game's code can send the page somewhere by itself (location = \u2026): networks reject a store that opens without a tap"),(["unity","adcolony"].includes(e.network)||e.network==="applovin"&&!t.info.made.includes("mraid")&&!t.info.made.includes("open"))&&!e.cfg.ios&&!e.cfg.android&&a.push(`Add the store links: ${i.label} opens the store from them`),!t.info.ends&&e.network==="mintegral"&&s.push(t.info.luna?"gameEnd goes out when the game calls Luna's LifeCycle.GameEnded, or else when the player taps install. Play it to the end in Mintegral's test tool":"The game never says when it ends, so gameEnd goes out when the player taps install. Play it to the end in Mintegral's test tool"),!t.info.ends&&e.network==="vungle"&&s.push(t.info.luna?"'complete' goes out when the game calls Luna's LifeCycle.GameEnded; check the game calls it":"The game never says when it ends; Liftoff likes a 'complete' message at the end"),{problems:[...new Set([...t.problems,...a])],warnings:[...new Set(s)]}}var J={applovin:{kind:"mraid",cta:"mraid.open",has:['<script src="mraid.js"><\/script>']},unity:{kind:"mraid",cta:"mraid.open",noMraid:!0},adcolony:{kind:"mraid",cta:"mraid.open",has:['<script src="mraid.js"><\/script>']},ironsource:{kind:"dapi",cta:"dapi.openStoreUrl",noMraid:!0},facebook:{kind:"plain",api:"FbPlayableAd.onCTAClick",noMraid:!0},moloco:{kind:"plain",api:"FbPlayableAd.onCTAClick",noMraid:!0},google:{kind:"plain",api:"ExitApi.exit",noMraid:!0,has:['<meta name="ad.orientation"','<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"><\/script>'],head:["exitapi.js"]},tiktok:{kind:"plain",api:"openAppStore",noMraid:!0,has:['"playable_orientation"',"playable-sdk.js"],body:["playable-sdk.js"]},snapchat:{kind:"plain",api:"ScPlayableAd.onCTAClick",noMraid:!0,has:['"playable_orientation"']},mintegral:{kind:"mintegral",cta:"install",end:"gameEnd",noMraid:!0},vungle:{kind:"vungle",cta:"download",end:"complete",noMraid:!0,has:["parent.postMessage('download','*')","parent.postMessage('complete','*')"]}};function We(e,t){let n=J[t],i=`<script>(function(){
  function post(t, x){ parent.postMessage({ psCheck: true, type: t, text: x === undefined ? "" : String(x) }, "*"); }
  var L = {}, ready = false, viewable = false, kind = "${n.kind}";
  function fire(e, v){ (L[e] || []).slice().forEach(function(f){ try { f(v); } catch(x){ post("error", x && x.message); } }); }
  var on = function(e, f){ (L[e] = L[e] || []).push(f); }, off = function(e, f){ L[e] = (L[e] || []).filter(function(g){ return g !== f; }); };
  var size = function(){ return { width: innerWidth, height: innerHeight }; };
  addEventListener("securitypolicyviolation", function(e){ post("outside", e.blockedURI + " (" + e.violatedDirective + ")"); });
  addEventListener("error", function(e){ post("error", e.message || (e.target && e.target.src ? "couldn't load " + e.target.src.slice(0, 80) : "")); }, true);
  addEventListener("unhandledrejection", function(e){ post("error", e.reason && e.reason.message || e.reason); });
  if (kind === "mraid") window.mraid = { getVersion: function(){ return "3.0"; }, getState: function(){ return ready ? "default" : "loading"; }, getPlacementType: function(){ return "interstitial"; },
    isViewable: function(){ return viewable; }, supports: function(){ return false; }, addEventListener: on, removeEventListener: off, open: function(u){ post("cta", "mraid.open"); post("url", u); },
    close: function(){}, useCustomClose: function(){}, expand: function(){}, getScreenSize: size, getMaxSize: size, getCurrentPosition: function(){ return { x: 0, y: 0, width: innerWidth, height: innerHeight }; },
    getDefaultPosition: function(){ return { x: 0, y: 0, width: innerWidth, height: innerHeight }; }, setOrientationProperties: function(){}, getOrientationProperties: function(){ return { allowOrientationChange: true, forceOrientation: "none" }; },
    getAudioVolume: function(){ return 1; } };
  if (kind === "dapi") window.dapi = { isReady: function(){ return ready; }, isViewable: function(){ return viewable; }, getAudioVolume: function(){ return 1; }, addEventListener: on, removeEventListener: off,
    openStoreUrl: function(){ post("cta", "dapi.openStoreUrl"); }, getScreenSize: size };
  if (kind === "mintegral") { window.gameReady = function(){ post("gameReady"); }; window.gameEnd = function(){ post("end", "gameEnd"); }; window.install = function(){ post("cta", "install"); }; }
  ${n.api?`(function(){ var p = ${JSON.stringify(n.api)}.split("."), o = window; p.slice(0, -1).forEach(function(k){ o = o[k] = o[k] || {}; }); o[p[p.length - 1]] = function(){ post("cta", ${JSON.stringify(n.api)}); }; })();`:""}
  // the picture stays readable after it's shown, so the check can see it isn't blank
  var gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(t, o){ if (/webgl/.test(t)) { o = o || {}; o.preserveDrawingBuffer = true; } return gc.call(this, t, o); };
  function state(){
    var g = window.__playspell, f = window.__psGame && window.__psGame();
    return g ? { booted: g.ready !== false, paused: !!g.world.paused, frames: g.Time.frameCount, canvas: !!document.querySelector("canvas"), hidden: document.hidden, own: true }
      : { booted: document.readyState === "complete", paused: !!(f && f.held), frames: f ? f.frames : 0, canvas: !!document.querySelector("canvas"), hidden: document.hidden };
  }
  function colours(){
    var g = window.__playspell, list = Array.prototype.slice.call(document.querySelectorAll("canvas")).filter(function(c){ return c.width * c.height > 0; });
    var c = list.sort(function(a, b){ return b.width * b.height - a.width * a.height; })[0];
    if (!c) return -1;
    if (g) g.step(1);
    var seen = {}, px = new Uint8Array(4), gl = c.__psGl || null, x2 = null;
    try { gl = c.getContext("webgl2") || c.getContext("webgl"); } catch(e){}
    if (!gl) try { x2 = c.getContext("2d"); } catch(e){}
    for (var y = 1; y < 10; y++) for (var x = 1; x < 10; x++) {
      var X = Math.floor(c.width * x / 10), Y = Math.floor(c.height * y / 10);
      if (gl) gl.readPixels(X, Y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); else if (x2) px = x2.getImageData(X, Y, 1, 1).data; else return -2;
      seen[px[0] + "," + px[1] + "," + px[2]] = 1;
    }
    return Object.keys(seen).length;
  }
  addEventListener("message", function(e){
    var m = e.data; if (!m || !m.cmd) return;
    try {
      if (m.cmd === "ready") { ready = true; fire("ready"); }
      if (m.cmd === "show" || m.cmd === "hide") { viewable = m.cmd === "show"; fire("viewableChange", kind === "dapi" ? { isViewable: viewable } : viewable);
        if (kind === "vungle") window.postMessage(viewable ? "ad-event-resume" : "ad-event-pause", "*");
        if (kind === "mintegral") (viewable ? window.gameStart : window.gameClose)(); }
      if (m.cmd === "call") (0, eval)(m.code);
      if (m.cmd === "end") window.__gameEnd();
      if (m.cmd === "state") setTimeout(function(){ post("state", JSON.stringify(state())); }, 50);
      if (m.cmd === "colours") post("colours", colours());
      if (m.cmd === "hooks") post("hooks", typeof window.gameStart + " " + typeof window.gameClose);
    } catch(x){ post("error", x && x.message); }
  });
  (function poll(){ var s = state(); if (s.booted) post("booted"); else setTimeout(poll, 50); })();
})();<\/script>`;return e.replace(/<script src="(https?:\/\/[^"]+|mraid\.js)"><\/script>/g,"<!-- $1 comes from the ad -->").replace(/<head\b[^>]*>/i,a=>a+i)}function Ge(e){let t=JSON.stringify(e.info.android||e.info.ios||"https://example.com/store"),n=e.info.playspell?["__cta()"]:e.info.calls.map(i=>i.replace("URL",t));return n.length?[...new Set(n)]:["__cta()"]}function Ve(e,t,n={}){let i=l=>F.encode(l),a=[],s=[];for(let{out:l,file:g,result:o}of t){let p="networks/"+l.network+"/",r=U[l.network],m={network:l.network,label:l.label,file:p+l.name,size:g.bytes.length,limit:l.network==="facebook"?2*R:r.limit||5*R,issues:[...(o?.problems??[]).map(c=>({level:"error",text:c})),...(o?.warnings??[]).map(c=>({level:"warning",text:c}))],notes:r.notes||[]};if(a.push({path:m.file,bytes:g.bytes}),l.pkg==="zip"){m.source=p+"source/"+l.entry,m.zip={entry:l.entry,extra:l.files.slice(1).map(c=>p+"source/"+c.path)},a.push({path:m.source,bytes:i(l.html)});for(let c of l.files.slice(1))a.push({path:p+"source/"+c.path,bytes:i(c.text)})}s.push(m)}let u=t[0]?.out.cfg??{title:n.title||e.info.title,ios:n.ios??e.info.ios,android:n.android??e.info.android,orientation:n.orientation||e.info.orientation},f={from:e.source.name,madeFor:e.info.madeFor},h=l=>i(JSON.stringify(l,null,1));return a.push({path:"release/index.html",bytes:i(ue(e,"preview",n).html)},{path:"networks/report.json",bytes:h({built:new Date().toISOString(),converted:f,settings:{title:u.title,ios:u.ios,android:u.android,orientation:u.orientation,languages:[]},builds:s})},{path:"networks/fields.json",bytes:i("[]")},{path:"build.json",bytes:h({built:new Date().toISOString(),converted:f})},{path:"PlaySpellVariations.json",bytes:h({store:{ios:u.ios||"",android:u.android||""},variations:[]})}),a}return be(Be);})();
