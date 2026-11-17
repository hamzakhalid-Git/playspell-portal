var PlaySpellConvert=(()=>{var N=Object.defineProperty;var le=Object.getOwnPropertyDescriptor;var de=Object.getOwnPropertyNames;var ce=Object.prototype.hasOwnProperty;var pe=(e,t)=>{for(var n in t)N(e,n,{get:t[n],enumerable:!0})},ue=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of de(t))!ce.call(e,a)&&a!==n&&N(e,a,{get:()=>t[a],enumerable:!(i=le(t,a))||i.enumerable});return e};var fe=e=>ue(N({},"__esModule",{value:!0}),e);var Ie={};pe(Ie,{CHECK:()=>B,NETWORKS:()=>U,NETWORK_IDS:()=>W,build:()=>Oe,checkPage:()=>Ue,flatten:()=>Pe,inspect:()=>ie,issues:()=>De,makeZip:()=>te,pack:()=>Re,read:()=>Ae,readZip:()=>Q,stemOf:()=>ne,testCalls:()=>Fe});var X=e=>JSON.stringify(e??""),E=e=>`
  var IOS = ${X(e.ios)}, AND = ${X(e.android)};
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
  if (!window.__gameEnd) window.__gameEnd = function(){};`,me={mraid:`
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
  if (!window.install) window.install = function(){ __cta(); };`};function L(e){let t="";for(let[n,i]of Object.entries(me))n!==e&&(t+=i);return t+`
  window.open = function(u){ __cta(typeof u === "string" ? u : null); return null; };`}var C=e=>`<script>
(function(){${e}
})();
<\/script>`;function H(e){return e?.analytics==="auto"||e?.analytics==="off"?e.analytics:"scripts"}function J(e,t){let n=H(t);return n==="auto"||n==="scripts"&&!!e?.challenge}var he=(e,t)=>{let n=H(t)==="auto",i=n?Math.max(0,Math.floor(Number(t?.tapsToFinish)||0)):0;return`
  var AL = { loading:"LOADING", loaded:"LOADED", displayed:"DISPLAYED", challengeStarted:"CHALLENGE_STARTED",
    challengePass25:"CHALLENGE_PASS_25", challengePass50:"CHALLENGE_PASS_50", challengePass75:"CHALLENGE_PASS_75",
    challengeSolved:"CHALLENGE_SOLVED", challengeFailed:"CHALLENGE_FAILED", challengeRetry:"CHALLENGE_RETRY",
    endCardShown:"ENDCARD_SHOWN", cta:"CTA_CLICKED" };
  var tracking = ${J(e,t)?"true":"false"}, auto = ${n?"true":"false"}, sent = {}, early = [], out = [], since = Date.now(), waiting = false, gone = false;
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
  ${!J(e,t)||e?.challengeStart?"":`addEventListener("pointerdown", function first(){
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
  }, true);`:""}`},z=(e,t)=>`
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
  })(0);`,U={applovin:{label:"AppLovin",pkg:"html",limit:5*1024*1024,orientation:"both",tags:()=>'<script src="mraid.js"><\/script>',bridge:(e,t)=>C(`${E(e)}${he(t,e)}
  window.__cta = function(url){
    if (!guard()) return;
    window.__track("cta");
    var dest = (typeof url === "string" && /^https?:/i.test(url)) ? url : storeUrl();
    try { if (window.mraid && mraid.open) { mraid.open(dest); return; } } catch(e){}
  };${z(e,!1)}${L("mraid")}`),notes:["Single HTML with every asset inside.","mraid.js is served by AppLovin; the tag 404s when you open the file locally, which is expected."],gameNotes:(e,t)=>{let n=H(t),i=Math.max(0,Math.floor(Number(t?.tapsToFinish)||0)),a=" AppLovin wants it only in playables with a real challenge: at least three interactions to finish, and no jump to the store within 5 seconds of the first tap.";return n==="off"?["Playable analytics off (PlaySpell Settings \u25B8 AppLovin analytics)."]:n==="auto"?["Playable analytics on, automatic: the challenge starts on the first tap and is solved "+(i?`after ${i} taps (25, 50 and 75% of them reported on the way), or when the game ends`:"when the game ends (GameEnded) or its end card shows")+(e?.gameEnd||e?.endCard||i?".":". No script ends the game or shows an end card, so it's never solved: set Taps to finish in PlaySpell Settings.")+a]:[e?.challenge?"Playable analytics on: AppLovin's reports show how far players get (loading, displayed, challenge started, 25/50/75%, solved or failed, retry, end card, CTA clicked)."+a:"Playable analytics off: no script reports a challenge solved or failed. Turn on PlaySpell Settings \u25B8 AppLovin analytics \u25B8 Automatic, or call PlaySpell.Analytics.ChallengeSolved() and ChallengeFailed() (or Luna's LevelWon and LevelFailed events)."]}},unity:{label:"Unity Ads",pkg:"html",limit:5*1024*1024,file:()=>"index.html",orientation:"both",tags:()=>"",bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.mraid && mraid.open) { mraid.open(storeUrl()); return; } } catch(e){}
  };${z(e,!0)}${L("mraid")}`),notes:["A single index.html. MRAID is injected by the ad: the game waits until the ad is viewable, pauses when hidden and follows the mute switch.","Store URLs are required."]},ironsource:{label:"ironSource",pkg:"html",limit:5*1024*1024,notice:{level:"warning",text:"ironSource Ads closed to new creatives on April 15, 2026, and direct demand ended on April 30. Upload to Unity Ads instead"},tags:()=>"",bridge:e=>C(`${E(e)}
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
  })(0);${L("dapi")}`),notes:["DAPI (ironSource's playable API): starts when viewable, CTA through dapi.openStoreUrl()."]},facebook:{label:"Meta (Facebook)",pkg:"html",limit:2*1024*1024,tags:()=>"",bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.FbPlayableAd && FbPlayableAd.onCTAClick) { FbPlayableAd.onCTAClick(); return; } } catch(e){}
  };${L("fbplayable")}`),notes:["Single HTML, 2 MB limit. CTA through FbPlayableAd.onCTAClick()."]},moloco:{label:"Moloco",pkg:"html",limit:5*1024*1024,tags:()=>"",bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.FbPlayableAd && FbPlayableAd.onCTAClick) { FbPlayableAd.onCTAClick(); return; } } catch(e){}
  };${L("fbplayable")}`),notes:["Single HTML, never zipped. CTA through FbPlayableAd.onCTAClick(). The runtime makes no XMLHttpRequest."]},google:{label:"Google Ads",pkg:"zip",limit:5*1024*1024,tags:e=>`<meta name="ad.orientation" content="${e.orientation==="landscape"?"landscape":e.orientation==="portrait"?"portrait":"portrait,landscape"}">
<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"><\/script>`,bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.ExitApi && ExitApi.exit) { ExitApi.exit(); return; } } catch(e){}
  };${L("exitapi")}`),notes:["ZIP with index.html at the root. Upload under App campaigns (ExitApi)."]},mintegral:{label:"Mintegral",pkg:"zip",limit:5*1024*1024,entry:e=>`${e}/${e}.html`,needsGameEnd:"error",orientation:"both",tags:()=>"",bridge:e=>C(`${E(e)}
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
  window.__playspellReady = function(){ try { if (typeof window.gameReady === "function") window.gameReady(); } catch(e){} };${L("install")}`),notes:["The ZIP, its folder and the HTML share one name (letters, numbers, underscores). Call Playable.GameEnded() on win and lose: Mintegral rejects builds that never call gameEnd.","A CTA has to stay visible for the whole playable, and it has to play with a mouse in a PC browser, where Mintegral's test tool runs it."]},tiktok:{label:"TikTok / Pangle",pkg:"zip",limit:5*1024*1024,warnAt:3*1024*1024,tags:()=>"",bodyTags:()=>'<script src="https://sf16-muse-va.ibytedtos.com/obj/union-fe-nc-i18n/playable/sdk/playable-sdk.js"><\/script>',bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (typeof window.openAppStore === "function") { window.openAppStore(); return; } } catch(e){}
  };${L("openappstore")}`),extraFiles:e=>[{path:"config.json",text:JSON.stringify({playable_orientation:e.orientation==="portrait"?1:e.orientation==="landscape"?2:0},null,2)}],notes:["ZIP with index.html and config.json. Upload it with a video or image, as TikTok pairs playables with one."]},vungle:{label:"Liftoff (Vungle)",pkg:"zip",limit:5*1024*1024,needsGameEnd:"warning",tags:()=>"",bridge:e=>C(`${E(e)}
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
  });${L("vungle")}`),notes:["ZIP with index.html. CTA sends 'download'; GameEnded sends 'complete', which opens the store by itself, so call it when the game has really ended."]},adcolony:{label:"AdColony / generic MRAID",pkg:"html",limit:5*1024*1024,tags:()=>'<script src="mraid.js"><\/script>',bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.mraid && mraid.open) { mraid.open(storeUrl()); return; } } catch(e){}
  };${z(e,!0)}${L("mraid")}`),notes:["Any MRAID 2.0 network (AdColony, Chartboost, InMobi, Digital Turbine\u2026)."]},snapchat:{label:"Snapchat",pkg:"zip",limit:5*1024*1024,orientation:"portrait",tags:()=>"",bridge:e=>C(`${E(e)}
  window.__cta = function(){
    if (!guard()) return;
    try { if (window.ScPlayableAd && ScPlayableAd.onCTAClick) { ScPlayableAd.onCTAClick(); return; } } catch(e){}
  };${L("scplayable")}`),extraFiles:()=>[{path:"config.json",text:JSON.stringify({playable_orientation:1,orientation:1},null,2)}],notes:["ZIP with index.html and config.json, portrait only, no MRAID. CTA through ScPlayableAd.onCTAClick(); the store comes from the campaign."]}},W=Object.keys(U);var we=new TextDecoder,F=new TextEncoder,P=e=>we.decode(e).replace(/^\uFEFF/,""),D=1048576;async function K(e,t){return new Uint8Array(await new Response(new Blob([e]).stream().pipeThrough(t)).arrayBuffer())}async function Q(e){let t=new DataView(e.buffer,e.byteOffset,e.byteLength),n=new Map,i=e.length-22,a=Math.max(0,e.length-65557);for(;i>=a&&t.getUint32(i,!0)!==101010256;)i--;if(i<a)throw new Error("This isn't a ZIP file, or it's damaged.");let o=t.getUint32(i+16,!0);for(let p=0,u=t.getUint16(i+10,!0);p<u;p++){if(t.getUint32(o,!0)!==33639248)throw new Error("The ZIP file is damaged.");let m=t.getUint16(o+8,!0),r=t.getUint16(o+10,!0),k=t.getUint32(o+20,!0),h=t.getUint16(o+28,!0),c=t.getUint16(o+30,!0),s=t.getUint16(o+32,!0),g=t.getUint32(o+42,!0),d=ee(P(e.subarray(o+46,o+46+h)));if(o+=46+h+c+s,!d||d.endsWith("/")||ge(d))continue;if(m&1)throw new Error("The ZIP file has a password. Make it again without one.");let S=g+30+t.getUint16(g+26,!0)+t.getUint16(g+28,!0),j=e.subarray(S,S+k);if(r===0)n.set(d,j.slice());else if(r===8)n.set(d,await K(j,new DecompressionStream("deflate-raw")));else throw new Error(`${d} is packed in a way browsers can't open (method ${r}). Make the ZIP again with your system's own zip.`)}return n}var ee=e=>e.replace(/\\/g,"/").replace(/^\.?\//,""),ge=e=>/(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$|desktop\.ini$|\.git\/)/i.test(e),ye=(()=>{let e=new Uint32Array(256);for(let t=0;t<256;t++){let n=t;for(let i=0;i<8;i++)n=n&1?3988292384^n>>>1:n>>>1;e[t]=n>>>0}return e})(),be=e=>{let t=4294967295;for(let n=0;n<e.length;n++)t=ye[(t^e[n])&255]^t>>>8;return(t^4294967295)>>>0};async function te(e){let t=[],n=[],i=0,a=new Date,o=a.getHours()<<11|a.getMinutes()<<5|a.getSeconds()>>1,p=a.getFullYear()-1980<<9|a.getMonth()+1<<5|a.getDate();for(let r of e){let k=F.encode(r.path),h=r.bytes??F.encode(r.text??""),c=await K(h,new CompressionStream("deflate-raw")),s=c.length<h.length,g=s?c:h,d=be(h),S=new DataView(new ArrayBuffer(30));[[0,67324752,4],[4,20,2],[6,2048,2],[8,s?8:0,2],[10,o,2],[12,p,2],[14,d,4],[18,g.length,4],[22,h.length,4],[26,k.length,2],[28,0,2]].forEach(([M,O,$])=>$===4?S.setUint32(M,O,!0):S.setUint16(M,O,!0)),t.push(new Uint8Array(S.buffer),k,g);let j=new DataView(new ArrayBuffer(46));[[0,33639248,4],[4,20,2],[6,20,2],[8,2048,2],[10,s?8:0,2],[12,o,2],[14,p,2],[16,d,4],[20,g.length,4],[24,h.length,4],[28,k.length,2],[42,i,4]].forEach(([M,O,$])=>$===4?j.setUint32(M,O,!0):j.setUint16(M,O,!0)),n.push(new Uint8Array(j.buffer),k),i+=30+k.length+g.length}let u=n.reduce((r,k)=>r+k.length,0),m=new DataView(new ArrayBuffer(22));return m.setUint32(0,101010256,!0),m.setUint16(8,e.length,!0),m.setUint16(10,e.length,!0),m.setUint32(12,u,!0),m.setUint32(16,i,!0),ve([...t,...n,new Uint8Array(m.buffer)])}function ve(e){let t=new Uint8Array(e.reduce((i,a)=>i+a.length,0)),n=0;for(let i of e)t.set(i,n),n+=i.length;return t}function ke(e){let t=[...e.keys()].filter(o=>/\.html?$/i.test(o));if(!t.length)throw new Error("There's no HTML page in this ZIP.");let n=o=>o.split("/").length,i=t.filter(o=>/(^|\/)index\.html?$/i.test(o)).sort((o,p)=>n(o)-n(p))[0];if(i)return i;let a=t.find(o=>{let p=o.split("/");return p.length===2&&p[1].replace(/\.html?$/i,"")===p[0]});return a||t.sort((o,p)=>n(o)-n(p)||e.get(p).length-e.get(o).length)[0]}async function Ae(e,t){let n=t[0]===80&&t[1]===75,i,a;if(n)i=await Q(t),a=ke(i);else{if(!/\.html?$/i.test(e)&&!/<(html|head|body|script|canvas)[\s>]/i.test(P(t.subarray(0,4096))))throw new Error("Drop an HTML file or a ZIP.");a=ee(e.split(/[\\/]/).pop()||"index.html"),i=new Map([[a,t]])}return{name:e,stem:ne(e,i.get(a)),kind:n?"zip":"html",files:i,entry:a,html:P(i.get(a)),size:t.length}}function ne(e,t){let n=String(e).split(/[\\/]/).pop().replace(/\.(html?|zip)$/i,"").replace(new RegExp("[_ .-]("+W.join("|")+"|ironsrc|meta|fb|pangle|liftoff|mraid)$","i"),"");return/^index$/i.test(n)&&t&&(n=(/<title>([^<]*)<\/title>/i.exec(P(t))||[])[1]||n),n.replace(/[^A-Za-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60)||"playable"}var _e=[{id:"playspell",label:"PlaySpell",re:/id="playspell-payload"/},{id:"mintegral",label:"Mintegral",re:/\bgameReady\s*\(|\bwindow\.install\s*\(|\bwindow\.gameEnd\b/,call:"install()"},{id:"vungle",label:"Liftoff (Vungle)",re:/postMessage\(\s*["'](?:download|complete)["']/,call:"__cta()"},{id:"google",label:"Google Ads",re:/exitapi\.js|\bExitApi\.exit\b/,call:"ExitApi.exit()"},{id:"tiktok",label:"TikTok / Pangle",re:/playable-sdk\.js|\bopenAppStore\s*\(/,call:"openAppStore()"},{id:"snapchat",label:"Snapchat",re:/\bScPlayableAd\b/,call:"ScPlayableAd.onCTAClick()"},{id:"facebook",label:"Meta / Moloco",re:/\bFbPlayableAd\b/,call:"FbPlayableAd.onCTAClick()"},{id:"ironsource",label:"ironSource",re:/\bdapi\.(?:openStoreUrl|isReady|addEventListener)\b/,call:"dapi.openStoreUrl()"},{id:"mraid",label:"MRAID (AppLovin, Unity Ads\u2026)",re:/mraid\.js|\bmraid\.(?:open|addEventListener|getState|isViewable)\b/,call:"mraid.open(URL)"},{id:"open",label:"a web page",re:/\bwindow\.open\s*\(/,call:"window.open(URL)"}];function ie(e){let t=ae(e),n=_e.filter(r=>r.re.test(t)),i=/https?:\/\/(?:apps|itunes)\.apple\.com\/[^\s"'<>\\)`,;]+/i.exec(t)?.[0]??"",a=/https?:\/\/play\.google\.com\/store\/apps\/details\?id=[\w.]+/i.exec(t)?.[0]??(/market:\/\/details\?id=([\w.]+)/i.exec(t)?"https://play.google.com/store/apps/details?id="+/market:\/\/details\?id=([\w.]+)/i.exec(t)[1]:""),o=/var IOS = ("(?:[^"\\]|\\.)*"), AND = ("(?:[^"\\]|\\.)*")/.exec(e.html),p=/<meta\s+name=["']ad\.orientation["']\s+content=["']([^"']*)["']/i.exec(e.html)?.[1]??"",u=/portrait/.test(p)&&/landscape/.test(p)?"both":/portrait/.test(p)?"portrait":/landscape/.test(p)?"landscape":"both",m=[...e.files.keys()].find(r=>/(^|\/)config\.json$/i.test(r));if(m)try{let r=JSON.parse(P(e.files.get(m))).playable_orientation;r===1&&(u="portrait"),r===2&&(u="landscape")}catch{}return{made:n.map(r=>r.id),madeFor:n.some(r=>r.id==="playspell")?["PlaySpell"]:n.filter(r=>r.id!=="open").map(r=>r.label),playspell:n.some(r=>r.id==="playspell"),calls:n.filter(r=>r.call).map(r=>r.call),ios:o&&JSON.parse(o[1])||i,android:o&&JSON.parse(o[2])||a,title:(/<title>([^<]*)<\/title>/i.exec(e.html)?.[1]??"").trim()||e.stem,orientation:u,ends:/\bgameEnd\s*\(|postMessage\(\s*["']complete["']|\bGameEnded\s*\(|__gameEnd/.test(t)||n.some(r=>r.id==="playspell"),readies:/\bgameReady\s*\(/.test(t)}}function ae(e){let t=e.html;for(let[n,i]of e.files)/\.(m?js|css|json|html?)$/i.test(n)&&n!==e.entry&&(t+=`
`+P(i));return t}var xe={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",avif:"image/avif",svg:"image/svg+xml",ico:"image/x-icon",mp3:"audio/mpeg",wav:"audio/wav",ogg:"audio/ogg",oga:"audio/ogg",m4a:"audio/mp4",aac:"audio/aac",mp4:"video/mp4",webm:"video/webm",m4v:"video/mp4",js:"text/javascript",mjs:"text/javascript",css:"text/css",json:"application/json",html:"text/html",htm:"text/html",txt:"text/plain",xml:"application/xml",atlas:"text/plain",fnt:"text/plain",plist:"application/xml",csv:"text/csv",glsl:"text/plain",vert:"text/plain",frag:"text/plain",woff:"font/woff",woff2:"font/woff2",ttf:"font/ttf",otf:"font/otf",wasm:"application/wasm",glb:"model/gltf-binary",gltf:"model/gltf+json",bin:"application/octet-stream",ktx:"image/ktx",ktx2:"image/ktx2",basis:"application/octet-stream"},oe=e=>xe[(/\.([a-z0-9]+)$/i.exec(e)?.[1]??"").toLowerCase()]??"application/octet-stream";function re(e){let t="";for(let n=0;n<e.length;n+=32768)t+=String.fromCharCode.apply(null,e.subarray(n,n+32768));return btoa(t)}var Y=(e,t)=>`data:${oe(e)};base64,${re(t)}`,G=e=>e.slice(0,e.lastIndexOf("/")+1);function Se(e){let t=[];for(let n of e.split("/"))n===".."?t.pop():n&&n!=="."&&t.push(n);return t.join("/")}function Ee(e){let t=new Map([...e.keys()].map(n=>[n.toLowerCase(),n]));return(n,i)=>{if(n=String(n??"").trim(),!n||/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(n))return null;let a=n.split(/[?#]/)[0];try{a=decodeURIComponent(a)}catch{}return a=Se(a.startsWith("/")?a:i+a),e.has(a)?a:t.get(a.toLowerCase())??null}}var q=e=>{let t=[];for(let n of String(e).matchAll(/([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g))t.push({name:n[1].toLowerCase(),raw:n[0],value:n[2]??n[3]??n[4]??""});return t},Le=/(^|\/)(mraid|dapi)\.js$|exitapi\.js$|playable-sdk\.js$|\/mintegral[^/]*\.js$|playturbo|mindworks-creative/i,V=e=>e.replace(/(?:window\.)?(?:parent|top)\.postMessage\(\s*(["'])download\1\s*,\s*(["'])\*\2\s*\)/g,"window.__cta()").replace(/(?:window\.)?(?:parent|top)\.postMessage\(\s*(["'])complete\1\s*,\s*(["'])\*\2\s*\)/g,"window.__gameEnd()"),Z="<!--ps:before-game-->",Ce=e=>e.replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--");function Pe(e){let t=ie(e),n=e.files,i=Ee(n),a=G(e.entry),o=[],p=[],u=new Set([e.entry]),m=new Set,r=new Set,k=new Set,h=new Set,c=(l,y,v=new Set)=>l.replace(/@import\s+(?:url\(\s*)?(["']?)([^"')\s;]+)\1\s*\)?\s*;/gi,(w,A,b)=>{let f=i(b,y);return!f||v.has(f)?w:(u.add(f),v.add(f),c(P(n.get(f)),G(f),v))}).replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi,(w,A,b)=>{let f=i(b,y);return f?(u.add(f),m.add(f),`url(${Y(f,n.get(f))})`):(/^(https?:)?\/\//i.test(b.trim())&&r.add(b.trim()),w)}),s=e.html,g=[],d=[],S=!1;if(s=s.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,(l,y,v)=>{let w=q(y),A=w.find(x=>x.name==="src"),b=w.find(x=>x.name==="type")?.value.toLowerCase()??"",f=w.filter(x=>!["src","integrity","crossorigin","async","defer","charset","nonce"].includes(x.name)).map(x=>" "+x.raw).join(""),_;if(A){let x=A.value;if(Le.test(x.split(/[?#]/)[0]))o.push(`Took out ${x.split("/").pop()}: each network's file gets its own`),_="";else{let R=i(x,a);if(R){u.add(R);let T=P(n.get(R));b==="module"&&/(?:^|[;\s}])import\s*(?:[\w*{$][^'"]*?from\s*)?["']\.{0,2}\/|\bimport\(\s*["']\.{0,2}\//.test(T)&&h.add(R),_=`<script${f}>${Ce(V(T))}<\/script>`,(w.some(se=>se.name==="defer")||b==="module")&&(d.push(_),_="")}else/^(https?:)?\/\//i.test(x)?r.add(x):k.add(x),_=l}}else if(/^\s*\(function\(\)\{\s*var IOS = /.test(v)&&/__playspellPaused/.test(v))_="";else{if(b&&!/javascript|module|^text\/babel$/.test(b))return _=l,g.push(_),`${g.length-1}`;_=`<script${y}>${V(v)}<\/script>`}return _&&!S&&(_=Z+_,S=!0),g.push(_),`${g.length-1}`}),s=s.replace(/<link\b([^>]*)>/gi,(l,y)=>{let v=q(y),w=v.find(f=>f.name==="rel")?.value.toLowerCase()??"",A=v.find(f=>f.name==="href")?.value??"",b=i(A,a);if(/stylesheet/.test(w)){if(!b)return/^(https?:)?\/\//i.test(A)?r.add(A):A&&k.add(A),l;u.add(b);let f=v.find(_=>_.name==="media");return`<style${f?" "+f.raw:""}>${c(P(n.get(b)),G(b)).replace(/<\/style/gi,"<\\/style")}</style>`}return b&&/icon|preload|prefetch|modulepreload|manifest/.test(w)||/^(https?:)?\/\//i.test(A)&&/preconnect|dns-prefetch/.test(w)?"":(/^(https?:)?\/\//i.test(A)&&r.add(A),l)}),s=s.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(l,y,v,w)=>y+c(v,a)+w),s=s.replace(/(\sstyle\s*=\s*)("([^"]*)"|'([^']*)')/gi,(l,y,v,w,A)=>{let b=w??A,f=c(b,a);return f===b?l:y+(w!==void 0?`"${f}"`:`'${f}'`)}),s=s.replace(/<([a-zA-Z][\w-]*)\b([^>]*)>/g,(l,y,v)=>{if(!/\s(?:src|href|poster|data-src|xlink:href)\s*=/i.test(v))return l;let w=y.toLowerCase()==="a";return"<"+y+v.replace(/(\s(?:src|href|poster|data-src|xlink:href)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi,(A,b,f,_,x)=>{let R=f??_??x,T=i(R,a);return T?w||/\.html?$/i.test(T)?A:(u.add(T),m.add(T),b+`"${Y(T,n.get(T))}"`):(!w&&/^(https?:)?\/\//i.test(R)&&r.add(R),A)})+">"}),s=s.replace(/<meta\s+name=["']ad\.(?:orientation|size)["'][^>]*>\s*/gi,"").replace(/<meta\s+charset\s*=\s*["']?[^"'>\s]*["']?\s*\/?>\s*/gi,"").replace(/<meta\s+http-equiv=["']content-type["'][^>]*>\s*/gi,"").replace(/^\uFEFF?\s*(<!--[\s\S]*?-->\s*)*<!doctype[^>]*>\s*/i,""),s=s.replace(/\u0001(\d+)\u0001/g,(l,y)=>g[y]),d.length&&!S&&(d[0]=Z+d[0],S=!0),d.length){let l=s.search(/<\/body>/i);s=l<0?s+d.join(`
`):s.slice(0,l)+d.join(`
`)+`
`+s.slice(l)}/<head[\s>]/i.test(s)||(s=/<html[^>]*>/i.test(s)?s.replace(/<html[^>]*>/i,l=>l+"<head></head>"):"<head></head>"+s),/<html[\s>]/i.test(s)||(s="<html>"+s+"</html>"),s=`<!DOCTYPE html>
`+s;let j=s.replace(/data:[^;,"')\s]+;base64,[A-Za-z0-9+/=]+/g,""),M={},O=0,$=[];for(let[l,y]of n){if(u.has(l)&&!m.has(l))continue;if(/\.(map|md|psd|ts|scss|less)$/i.test(l)||/(^|\/)(readme|license|changelog)[^/]*$/i.test(l)){$.push(l);continue}if(/(^|\/)config\.json$/i.test(l)&&/playable_orientation/.test(P(y)))continue;if(/\.html?$/i.test(l)&&l!==e.entry){$.push(l);continue}let v=l.split("/").pop();if(m.has(l)&&!j.includes(v))continue;let w=l.startsWith(a)?l.slice(a.length):l;M[w]=[oe(l),re(/\.m?js$/i.test(l)?F.encode(V(P(y))):y)],O+=y.length}let I=Object.keys(M).length;e.kind==="zip"&&o.push(`${n.size} files in the ZIP; ${u.size} went into the page${I?`, and ${I} more the game loads by itself are packed in with it`:""}`),$.length&&o.push("Left out, as no game needs them: "+$.slice(0,6).join(", ")+($.length>6?` and ${$.length-6} more`:""));for(let l of r)p.push(`Loads ${l} from the internet. Ad networks block that: put the file in the ZIP and link to it there`);for(let l of h)p.push(`${l} imports other code files (JavaScript modules), which a one-file ad can't do. Build the game into one script, without code splitting, and drop it again`);for(let l of k)p.push(`The page asks for ${l}, which isn't in the ${e.kind==="zip"?"ZIP":"upload. Drop a ZIP of the page with its files instead"}`);return!t.calls.length&&!t.playspell&&p.push("No install button found: the game calls none of the networks' store APIs (mraid.open, ExitApi.exit, FbPlayableAd.onCTAClick, window.open\u2026), so no network can open the store from it"),{page:s,vfs:I?M:null,vfsBytes:O,usesXhr:/XMLHttpRequest/.test(ae(e)),info:t,notes:o,problems:p,stem:e.stem,source:e}}function $e(e){let t=[];for(let n of e.matchAll(/<([a-zA-Z][\w-]*)\b([^>]*)>/g))if(n[1].toLowerCase()!=="a")for(let i of q(n[2]))["src","href","poster","data-src"].includes(i.name)&&/^(https?:)?\/\//i.test(i.value)&&t.push(i.value);return t}var Me=e=>`(function(){
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
})();`,Te=`(function(){
  if (window.PlaySpell && window.PlaySpell.setPaused) return;
  var held = false, muted = false, frames = 0, seq = 0, parked = {}, live = {};
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
})();`,je=(e,t)=>{let n="";return e==="mintegral"?(n+=`var names = ["install", "gameEnd", "gameReady"], mine = {};
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
  addEventListener("load", function(){ setTimeout(function(){ if (typeof window.gameStart === "function") try { window.gameStart(); } catch(e){} }, 0); });`),n?`<script>
(function(){
  ${n}
})();
<\/script>`:""};function Oe(e,t,n={}){let i=U[t];if(!i)throw new Error("No network called "+t);let a={title:n.title||e.info.title,ios:n.ios??e.info.ios,android:n.android??e.info.android,orientation:n.orientation||e.info.orientation,analytics:"off"},o=!e.info.playspell,p=!!e.vfs&&e.usesXhr,u=e.page,m="width=device-width,initial-scale=1";u=u.replace(/<meta\s+name=["']viewport["']\s+content=["']([^"']*)["'][^>]*>\s*/i,(d,S)=>(m=S,""));let r=m.split(/[,;]/).map(d=>d.trim()).filter(Boolean).filter(d=>!/^(user-scalable|maximum-scale|minimum-scale)\s*=/i.test(d));r.some(d=>/^width\s*=/i.test(d))||r.unshift("width=device-width"),r.some(d=>/^initial-scale\s*=/i.test(d))||r.push("initial-scale=1"),r.push("maximum-scale=1","user-scalable=no");let k=`<meta charset="utf-8">
<meta name="viewport" content="${r.join(",").replace(/"/g,"")}">
`+(i.tags(a)?i.tags(a)+`
`:"")+(e.vfs?`<script type="application/json" id="ps-files">${JSON.stringify(e.vfs).replace(/</g,"\\u003c")}<\/script>
<script>${Me(p)}<\/script>
`:"")+(o?`<script>${Te}<\/script>
`:"")+i.bridge(a,{})+`
`+(o?je(t,e.info):""),h=u.replace(/<head\b[^>]*>/i,d=>d+`
`+k).replace(Z,o&&t==="mintegral"?"<script>window.__psKeep && window.__psKeep();<\/script>":""),c=i.bodyTags?.(a)??"";c&&(h=/<body\b[^>]*>/i.test(h)?h.replace(/<body\b[^>]*>/i,d=>d+`
`+c):h.replace(/<\/head>/i,d=>d+`
<body>
`+c));let s=`${n.stem||e.stem}_${t}`;if(i.pkg==="zip"){let d=i.entry?i.entry(s):"index.html";return{network:t,label:i.label,pkg:"zip",name:s+".zip",entry:d,html:h,files:[{path:d,text:h},...i.extraFiles?i.extraFiles(a):[]],cfg:a,tags:i.tags(a)+c}}let g=i.file?i.file(s):s+".html";return{network:t,label:i.label,pkg:"html",name:g,entry:g,html:h,files:[{path:g,text:h}],cfg:a,tags:i.tags(a)+c}}async function Re(e){return{name:e.name,bytes:e.pkg==="zip"?await te(e.files):F.encode(e.html)}}function De(e,t,n){let i=U[e.network],a=[],o=[],p=e.network==="facebook"?2*D:i.limit||5*D;n>p?a.push(`${(n/D).toFixed(2)} MB is over ${i.label}'s ${p/D} MB limit`):i.warnAt&&n>i.warnAt&&o.push(`${(n/D).toFixed(2)} MB; ${i.label} recommends under ${i.warnAt/D} MB`),i.notice&&o.push(i.notice.text);let u=e.html.replace(/<script id="playspell-payload"[\s\S]*?<\/script>/,"").replace(/<script type="application\/json" id="ps-files">[\s\S]*?<\/script>/,"");for(let c of new Set($e(u)))!e.tags.includes(c)&&!t.problems.some(s=>s.includes(c))&&a.push(`Loads ${c} from the internet; ${i.label} only takes files that hold everything`);let m=B[e.network],r=u+(e.files.find(c=>c.path==="config.json")?.text??""),k=u.search(/<\/head>/i);for(let c of m.has||[])r.includes(c)||a.push("Missing "+c);m.noMraid&&/<script\b[^>]*\bsrc\s*=\s*["'][^"']*mraid\.js/i.test(u)&&a.push(`Must not load mraid.js: ${i.label} has no MRAID`);for(let c of m.head||[])(u.indexOf(c)<0||u.indexOf(c)>k)&&a.push(c+" has to be in <head>");for(let c of m.body||[])u.indexOf(c)<k&&a.push(c+" has to be in <body>");if(/^<!DOCTYPE html>/.test(e.html)||a.push("No <!DOCTYPE html>"),/<meta charset="utf-8">/i.test(e.html.slice(0,1024))||a.push("No UTF-8 charset at the top"),/<meta name="viewport" content="[^"]*user-scalable=no/.test(e.html.slice(0,2048))||a.push("The page can be zoomed: Mintegral turns that down"),e.network==="mintegral"&&!/^[A-Za-z0-9_]+\.zip$/.test(e.name)&&a.push("Mintegral's names may only use letters, numbers and underscores"),e.pkg==="zip"){let c=e.network==="mintegral"?[e.entry]:["index.html",...["tiktok","snapchat"].includes(e.network)?["config.json"]:[]],s=e.files.map(d=>d.path);c.slice().sort().join()!==s.slice().sort().join()&&a.push(`The ZIP should hold ${c.join(", ")}; it holds ${s.join(", ")}`);let g=e.files.find(d=>d.path==="config.json");if(g)try{JSON.parse(g.text)}catch{a.push("config.json isn't valid JSON")}}return e.network==="moloco"&&/XMLHttpRequest/.test(u)&&a.push("The game's code has XMLHttpRequest in it, and Moloco rejects files that do"),/(?:^|[^.\w$])(?:window\.|top\.|self\.|parent\.)?location(?:\.href)?\s*=(?!=)|\blocation\.(?:assign|replace)\s*\(/.test(u)&&o.push("The game's code can send the page somewhere by itself (location = \u2026): networks reject a store that opens without a tap"),(["unity","adcolony"].includes(e.network)||e.network==="applovin"&&!t.info.made.includes("mraid")&&!t.info.made.includes("open"))&&!e.cfg.ios&&!e.cfg.android&&a.push(`Add the store links: ${i.label} opens the store from them`),!t.info.ends&&e.network==="mintegral"&&o.push("The game never says when it ends, so gameEnd goes out when the player taps install. Play it to the end in Mintegral's test tool"),!t.info.ends&&e.network==="vungle"&&o.push("The game never says when it ends; Liftoff likes a 'complete' message at the end"),{problems:[...new Set([...t.problems,...a])],warnings:[...new Set(o)]}}var B={applovin:{kind:"mraid",cta:"mraid.open",has:['<script src="mraid.js"><\/script>']},unity:{kind:"mraid",cta:"mraid.open",noMraid:!0},adcolony:{kind:"mraid",cta:"mraid.open",has:['<script src="mraid.js"><\/script>']},ironsource:{kind:"dapi",cta:"dapi.openStoreUrl",noMraid:!0},facebook:{kind:"plain",api:"FbPlayableAd.onCTAClick",noMraid:!0},moloco:{kind:"plain",api:"FbPlayableAd.onCTAClick",noMraid:!0},google:{kind:"plain",api:"ExitApi.exit",noMraid:!0,has:['<meta name="ad.orientation"','<script src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"><\/script>'],head:["exitapi.js"]},tiktok:{kind:"plain",api:"openAppStore",noMraid:!0,has:['"playable_orientation"',"playable-sdk.js"],body:["playable-sdk.js"]},snapchat:{kind:"plain",api:"ScPlayableAd.onCTAClick",noMraid:!0,has:['"playable_orientation"']},mintegral:{kind:"mintegral",cta:"install",end:"gameEnd",noMraid:!0},vungle:{kind:"vungle",cta:"download",end:"complete",noMraid:!0,has:["parent.postMessage('download','*')","parent.postMessage('complete','*')"]}};function Ue(e,t){let n=B[t],i=`<script>(function(){
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
})();<\/script>`;return e.replace(/<script src="(https?:\/\/[^"]+|mraid\.js)"><\/script>/g,"<!-- $1 comes from the ad -->").replace(/<head\b[^>]*>/i,a=>a+i)}function Fe(e){let t=JSON.stringify(e.info.android||e.info.ios||"https://example.com/store"),n=e.info.playspell?["__cta()"]:e.info.calls.map(i=>i.replace("URL",t));return n.length?[...new Set(n)]:["__cta()"]}return fe(Ie);})();
