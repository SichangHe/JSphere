//26 jsphere effectiveLen
(function(){eval(`function aa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
function ba(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof n&&n];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}
function r(a,b){if(b)a:{var c=p;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&l(c,a,{configurable:!0,writable:!0,value:b})}}
function ca(a){a={next:a};a[Symbol.iterator]=function(){return this};return a}
function da(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};e[Symbol.iterator]=function(){return e};return e}
function v(a){if(u!==u)throw Error("Bad secret");this.h=a}
function x(a){console.warn("A URL with content '"+a+"' was sanitized away.")}
`);
eval(`function y(a,b,c){var d=Array.prototype.slice.call(arguments,2);return function(){var e=d.slice();e.push.apply(e,arguments);return a.apply(b,e)}}
function ea(a,b){if(a){var c=Array.prototype.slice.call(arguments,1);try{return a.apply(null,c)}catch(d){return d}}}
function A(a,b){if(a.forEach)a.forEach(b,void 0);else for(var c=0,d=a.length;c<d;c++)c in a&&b.call(void 0,a[c],c,a)}
function C(a,b){if(a.some)return a.some(b,void 0);for(var c=0,d=a.length;c<d;c++)if(c in a&&b.call(void 0,a[c],c,a))return!0;return!1}
function D(a){return Object.prototype.toString.call(a)=="[object Array]"?a:[a]}
function E(a,b){return F[a]=b}
function H(a){var b=I();a in b&&delete b[a]}
function fa(){var a=I();for(b in a)J(a[b])||delete a[b];a=I();var b=parseInt(G["cache-max"],10);b=isNaN(b)?Infinity:b;b=Object.keys(a).length-b;if(!(b<=0))for(var c=0;c<b;c++){var d=Infinity,e;for(e in a)if(a[e].count<d){var f=e;d=a[e].count}delete a[f]}}
`);
eval(`function J(a){if(!(a&&"data"in a))return!1;var b=a.life;b=isNaN(b)?Infinity:b;a=a.time;return z()-a<b}
function K(a){var b=parseInt(F["cache-counter"],10)||0;b++;E("cache-counter",b);a.count=b}
function I(){return"cache-storage"in F?F["cache-storage"]:E("cache-storage",{})}
function L(a,b){var c=a.length-b.length;return c>=0&&a.indexOf(b,c)==c}
function N(a,b){a=a.split(b);var c=a.length==1;return[a[0],c?"":b,c?"":a.slice(1).join(b)]}
function O(a){a.data&&Object.prototype.toString.call(a.data)=="[object String]"&&a.data.lastIndexOf("spf:",0)==0&&P(a.data.substring(4))}
function P(a){var b=Q[a];b&&(delete Q[a],b())}
function R(a){window.addEventListener?window.addEventListener("message",a,!1):window.attachEvent&&window.attachEvent("onmessage",a)}
function S(a){window.removeEventListener?window.removeEventListener("message",a,!1):window.detachEvent&&window.detachEvent("onmessage",a)}
`);
eval(`function U(a){var b=document.createElement("a");b.href=a;b.href=b.href;a={href:b.href,protocol:b.protocol,host:b.host,hostname:b.hostname,port:b.port,pathname:b.pathname,search:b.search,hash:b.hash,username:b.username,password:b.password};a.origin=a.protocol+"//"+a.host;a.pathname&&a.pathname[0]=="/"||(a.pathname="/"+a.pathname);return a}
function ia(a){a=U(a);return N(a.href,"#")[0]}
function oa(a,b,c){if(b){b=[];var d=0;c&&(a+="\\r\\n");var e=a.indexOf("[\\r\\n",d);for(e>-1&&(d=e+3);(e=a.indexOf(",\\r\\n",d))>-1;){var f=M(a.substring(d,e));d=e+3;f&&b.push(JSON.parse(f))}e=a.indexOf("]\\r\\n",d);e>-1&&(f=M(a.substring(d,e)),d=e+3,f&&b.push(JSON.parse(f)));f="";a.length>d&&(f=a.substring(d),c&&L(f,"\\r\\n")&&(f=f.substring(0,f.length-2)));b=V(b);return{m:b,g:f}}a=JSON.parse(a);b=V(D(a));return{m:b,g:""}}
function V(a){var b=D(a);A(b,function(c){if(c){c.head&&(c.head=W(c.head));if(c.body)for(var d in c.body)c.body[d]=W(c.body[d]);c.foot&&(c.foot=W(c.foot))}});return a}
function W(a){eval(\`var b=new pa;
if(!a)return b;
if(Object.prototype.toString.call(a)!="[object String]")return a.scripts&&A(a.scripts,function(c){b.scripts.push({url:c.url||"",text:c.text||"",name:c.name||"",async:c.async||!1})}),a.styles&&A(a.styles,function(c){b.styles.push({url:c.url||"",text:c.text||"",name:c.name||""})}),a.links&&A(a.links,function(c){c.rel=="spf-preconnect"&&b.links.push({url:c.url||"",rel:c.rel||""})}),b.html=a.html||"",b;
a=a.replace(qa,function(c,d,e,f){if(d=="script"){d=(d=e.match(X))?
d[1]:"";var h=e.match(ra);h=h?h[1]:"";var k=sa.test(e);e=ta.exec(e);return(e=!e||e[1].indexOf("/javascript")!=-1||e[1].indexOf("/x-javascript")!=-1||e[1].indexOf("/ecmascript")!=-1)?(b.scripts.push({url:h,text:f,name:d,async:k}),""):c}return d=="style"&&(d=(d=e.match(X))?d[1]:"",e=ta.exec(e),e=!e||e[1].indexOf("text/css")!=-1)?(b.styles.push({url:"",text:f,name:d}),""):c});
\`);
eval(\`a=a.replace(ua,function(c,d){var e=d.match(va);e=e?e[1]:"";return e=="stylesheet"?(e=(e=d.match(X))?e[1]:"",d=(d=d.match(wa))?
d[1]:"",b.styles.push({url:d,text:"",name:e}),""):e=="spf-preconnect"?(d=(d=d.match(wa))?d[1]:"",b.links.push({url:d,rel:e}),""):c});
b.html=a;
return b
\`);
}
`);
eval(`function pa(){this.html="";this.scripts=[];this.styles=[];this.links=[]}
function xa(a,b,c,d){eval(\`var e=d||{},f=!1,h=0,k,g=new XMLHttpRequest;
g.open(a,b,!0);
g.timing={};
var m=g.abort;
g.abort=function(){clearTimeout(k);g.onreadystatechange=null;m.call(g)};
g.onreadystatechange=function(){var q=g.timing;if(g.readyState==2){q.responseStart=q.responseStart||z();if(g.responseType=="json")f=!1;else if(G["assume-all-json-requests-chunked"]||(g.getResponseHeader("Transfer-Encoding")||"").toLowerCase().indexOf("chunked")>-1)f=!0;else{q=g.getResponseHeader("X-Firefox-Spdy");var B=window.chrome&&
chrome.loadTimes&&chrome.loadTimes();B=B&&B.wasFetchedViaSpdy;f=!(!q&&!B)}e.u&&e.u(g)}else g.readyState==3?f&&e.l&&(q=g.responseText.substring(h),h=g.responseText.length,e.l(g,q)):g.readyState==4&&(q.responseEnd=q.responseEnd||z(),window.performance&&window.performance.getEntriesByName&&(g.resourceTiming=window.performance.getEntriesByName(b).pop()),f&&e.l&&g.responseText.length>h&&(q=g.responseText.substring(h),h=g.responseText.length,e.l(g,q)),clearTimeout(k),e.s&&e.s(g))};
\`);
eval(\`"responseType"in g&&e.responseType==
"json"&&(g.responseType="json");
e.withCredentials&&(g.withCredentials=e.withCredentials);
d="FormData"in window&&c instanceof FormData;
a=a=="POST"&&!d;
if(e.headers)for(var t in e.headers)g.setRequestHeader(t,e.headers[t]),"content-type"==t.toLowerCase()&&(a=!1);
a&&g.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
e.C>0&&(k=setTimeout(function(){g.abort();e.A&&e.A(g)},e.C));
g.timing.fetchStart=z();
g.send(c);
return g
\`);
}
function ya(a,b,c,d,e){var f=!1;c.responseStart=c.responseEnd=z();b.type&&b.type.lastIndexOf("navigate",0)==0&&(c.navigationStart=c.startTime,G["cache-unified"]||(H(d),f=!0));b.j&&e.type=="multipart"&&A(e.parts,function(h){h.timing||(h.timing={});h.timing.spfCached=!!c.spfCached;h.timing.spfPrefetched=!!c.spfPrefetched;b.j(a,h)});za(a,b,c,e,f)}
function Aa(a,b,c){a=c.getResponseHeader("X-SPF-Response-Type")||"";b.o=a.toLowerCase().indexOf("multipart")!=-1}
function Ba(a,b,c,d,e,f,h){if(d.o){f=d.g+f;try{var k=oa(f,!0,h)}catch(g){e.abort();b.i&&b.i(a,g,e);return}b.j&&A(k.m,function(g){g.timing||(g.timing={});g.timing.spfCached=!!c.spfCached;g.timing.spfPrefetched=!!c.spfPrefetched;b.j(a,g)});d.h=d.h.concat(k.m);d.g=k.g}}
function Ca(a,b,c,d,e){eval(\`if(e.timing)for(var f in e.timing)c[f]=e.timing[f];
if(e.resourceTiming)if(b.type=="load")for(var h in e.resourceTiming)c[h]=e.resourceTiming[h];else if(window.performance&&window.performance.timing&&(f=window.performance.timing.navigationStart,f+e.resourceTiming.startTime>=c.startTime))for(var k in e.resourceTiming)h=e.resourceTiming[k],h!==void 0&&(L(k,"Start")||L(k,"End")||k=="startTime")&&(c[k]=f+Math.round(h));
b.type!="load"&&(c.navigationStart=c.startTime);
d.h.length&&
(d.g=M(d.g),d.g&&Ba(a,b,c,d,e,"",!0));
if(e.responseType=="json"){if(!e.response){b.i&&b.i(a,Error("JSON response parsing failed"),e);return}var g=V(D(e.response))}else try{g=oa(e.responseText).m}catch(t){b.i&&b.i(a,t,e);return}
if(b.j&&g.length>1)for(d=d.h.length;d<g.length;d++)e=g[d],e.timing||(e.timing={}),e.timing.spfCached=!!c.spfCached,e.timing.spfPrefetched=!!c.spfPrefetched,b.j(a,e);
\`);
eval(\`if(g.length>1){var m;A(g,function(t){t.cacheType&&(m=t.cacheType)});g={parts:g,type:"multipart"};m&&(g.cacheType=
m)}else g=g.length==1?g[0]:{};
za(a,b,c,g,!0)
\`);
}
`);
eval(`function za(a,b,c,d,e){if(e&&b.method!="POST"&&(e=Da(a,b.current,d.cacheType,b.type,!0))){d.cacheKey=e;var f={response:d,type:b.type||""},h=parseInt(G["cache-lifetime"],10),k=parseInt(G["cache-max"],10);h<=0||k<=0||(k=I(),f={data:f,life:h,time:z(),count:0},K(f),k[e]=f,setTimeout(fa,1E3))}d.timing=c;b.v&&b.v(a,d)}
function Da(a,b,c,d,e){a=ia(a);var f;G["cache-unified"]?f=a:d=="navigate-back"||d=="navigate-forward"?f="history "+a:d=="navigate"?f=(e?"history ":"prefetch ")+a:d=="prefetch"&&(f=e?"prefetch "+a:"");b&&c=="url"?f+=" previous "+b:b&&c=="path"&&(f+=" previous "+U(b).pathname);return f||""}
function Ea(a,b){var c=[];b&&(c.push(a+" previous "+b),c.push(a+" previous "+U(b).pathname));c.push(a);var d=null;C(c,function(e){a:{var f=I();if(e in f){f=f[e];if(J(f)){K(f);f=f.data;break a}H(e)}f=void 0}f&&(d={key:e,response:f.response,type:f.type});return!!f});return d}
function Fa(){this.o=!1;this.g="";this.h=[]}
`);
eval(`function Y(a,b){if(a){var c=Array.prototype.slice.call(arguments);c[0]=a;c=ea.apply(null,c)}return c!==!1}
function Ga(a,b,c,d){Y((a||{}).onError,{url:b,err:c,xhr:d})}
function Ha(a,b,c){Y((a||{}).onPartProcess,{url:b,part:c})&&Y((a||{}).onPartDone,{url:b,part:c})}
function Ia(a,b,c){var d;(d=c.type=="multipart")||(d=Y((a||{}).onProcess,{url:b,response:c}));d&&Y((a||{}).onDone,{url:b,response:c})}
var l=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;a[b]=c.value;return a};
var p=ba(this);
r("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(d+(f||"")+"_"+e++,f)}function c(f,h){this.h=f;l(this,"description",{configurable:!0,writable:!0,value:h})}if(a)return a;c.prototype.toString=function(){return this.h};var d="jscomp_symbol_"+(Math.random()*1E9>>>0)+"_",e=0;return b});
`);
eval(`r("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");for(var b="Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "),c=0;c<b.length;c++){var d=p[b[c]];typeof d==="function"&&typeof d.prototype[a]!="function"&&l(d.prototype,a,{configurable:!0,writable:!0,value:function(){return ca(aa(this))}})}return a});
r("Array.prototype.keys",function(a){return a?a:function(){return da(this,function(b){return b})}});
var u={};
v.prototype.toString=function(){return this.h};
new v("about:blank");
new v("about:invalid#zClosurez");
var w=[];
w.indexOf(x)===-1&&w.push(x);
var z=window.performance&&window.performance.timing&&window.performance.now?function(){return window.performance.timing.navigationStart+window.performance.now()}:function(){return(new Date).getTime()};
;
var F=window._spf_state||{};
window._spf_state=F;
var G={};
"config"in F||E("config",G);
G=F.config;
;
`);
eval(`var M=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^\\s+|\\s+$/g,"")};
;
var T=function(){function a(){b=!1}if(!window.postMessage)return!1;var b=!0;R(a);window.postMessage("","*");S(a);return b}(),Q={};
"async-defers"in F||E("async-defers",Q);
Q=F["async-defers"];
T&&("async-listener"in F&&S(F["async-listener"]),R(O),E("async-listener",O));
var ha={};
"ps-s"in F||E("ps-s",ha);
ha=F["ps-s"];
;
var ja={},ka={},la={};
"rsrc-s"in F||E("rsrc-s",ja);
ja=F["rsrc-s"];
"rsrc-n"in F||E("rsrc-n",ka);
ka=F["rsrc-n"];
"rsrc-u"in F||E("rsrc-u",la);
la=F["rsrc-u"];
var ma={};
"js-d"in F||E("js-d",ma);
ma=F["js-d"];
var na={};
"js-u"in F||E("js-u",na);
na=F["js-u"];
(function(){var a=document.createElement("div");return"transition"in a.style?!0:C(["webkit","Moz","Ms","O","Khtml"],function(b){return b+"Transition"in a.style})})();
`);
eval(`var ua=/\\x3clink([\\s\\S]*?)\\x3e/ig,qa=/\\x3c(script|style)([\\s\\S]*?)\\x3e([\\s\\S]*?)\\x3c\\/\\1\\x3e/ig,sa=/(?:\\s|^)async(?:\\s|=|$)/i,wa=/(?:\\s|^)href\\s*=\\s*["']?([^\\s"']+)/i,X=/(?:\\s|^)name\\s*=\\s*["']?([^\\s"']+)/i,va=/(?:\\s|^)rel\\s*=\\s*["']?([^\\s"']+)/i,ra=/(?:\\s|^)src\\s*=\\s*["']?([^\\s"']+)/i,ta=/(?:\\s|^)type\\s*=\\s*["']([^"']+)["']/i;
;
;
;
`);
eval(`var Ja={request:function(a,b){b=b||{};b={method:b.method,headers:b.experimental_headers,j:y(Ha,null,b),i:y(Ga,null,b),v:y(Ia,null,b),D:b.postData,type:"",current:window.location.href,B:window.location.href};b.method=((b.method||"GET")+"").toUpperCase();b.type=b.type||"request";var c=a,d=G["url-identifier"]||"";if(d){d=d.replace("__type__",b.type||"");var e=N(c,"#"),f=N(e[0],"?");c=f[0];var h=f[1];f=f[2];var k=e[1];e=e[2];if(d.lastIndexOf("?",0)==0)h&&(d=d.replace("?","&")),f+=d;else{if(d.lastIndexOf(".",
0)==0)if(L(c,"/"))d="index"+d;else{var g=c.lastIndexOf(".");g>-1&&(c=c.substring(0,g))}else L(c,"/")&&d.lastIndexOf("/",0)==0&&(d=d.substring(1));c+=d}c=c+h+f+k+e}d=ia(c);c={};c.spfUrl=d;c.startTime=z();c.fetchStart=c.startTime;h=Da(a,b.current,null,b.type,!1);h=Ea(h,b.current);c.spfPrefetched=!!h&&h.type=="prefetch";c.spfCached=!!h;if(h){a=y(ya,null,a,b,c,h.key,h.response);b=window._spf_state=window._spf_state||{};var m=parseInt(b.uid,10)||0;m++;b=b.uid=m;Q[b]=a;T?window.postMessage("spf:"+b,"*"):
window.setTimeout(y(P,null,b),0);a=null}else{h={};if(f=G["request-headers"])for(m in f)k=f[m],h[m]=k==null?"":String(k);if(b.headers)for(m in b.headers)k=b.headers[m],h[m]=k==null?"":String(k);b.B!=null&&(h["X-SPF-Referer"]=b.B);b.current!=null&&(h["X-SPF-Previous"]=b.current);if(m=G["advanced-header-identifier"])h["X-SPF-Request"]=m.replace("__type__",b.type),h.Accept="application/json";m=new Fa;f=y(Ca,null,a,b,c,m);a={headers:h,C:G["request-timeout"],u:y(Aa,null,a,m),l:y(Ba,null,a,b,c,m),s:f,A:f};
b.withCredentials&&(a.withCredentials=b.withCredentials);G["advanced-response-type-json"]&&(a.responseType="json");a=b.method=="POST"?xa("POST",d,b.D,a):xa("GET",d,null,a)}return a}},n=this;
`);
eval(`n.spf=n.spf||{};
var Ka=n.spf,Z;
for(Z in Ja)Ka[Z]=Ja[Z];
`);
}).call(this);