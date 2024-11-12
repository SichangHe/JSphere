import { parse } from "acorn"

const parseOptions = { ecmaVersion: "latest", sourceType: "module" }

const tree = parse(
    `
import { parse } from "acorn"

const tree = parse("1 + 1", { ecmaVersion: 2025 })
log(tree)
for (const statement of tree.body) {
    log(statement)
}
function log(input) {
    console.log(input)
}
var a;
`,
    parseOptions,
)
console.log("tree:", tree, "\n")
for (const statement of tree.body) {
    console.log(statement, "\n")
}
const requireInModule = parse(`const acorn = require("acorn");`, parseOptions)
console.log("requireInModule:", requireInModule, "\n")

const lambda = parse(
    `(function() {
    console.log("anonymous");
    return 0;
})();
(() => {
    console.log("arrow");
    return 1;
})();
`,
    parseOptions,
)
console.log("lambda:", lambda, "\n")
for (const statement of lambda.body) {
    console.log(statement, "\n")
}

const fnInFn = parse(
    `function Ca(a,b,c,d,e){if(e.timing)for(var f in e.timing)c[f]=e.timing[f];if(e.resourceTiming)if(b.type=="load")for(var h in e.resourceTiming)c[h]=e.resourceTiming[h];else if(window.performance&&window.performance.timing&&(f=window.performance.timing.navigationStart,f+e.resourceTiming.startTime>=c.startTime))for(var k in e.resourceTiming)h=e.resourceTiming[k],h!==void 0&&(L(k,"Start")||L(k,"End")||k=="startTime")&&(c[k]=f+Math.round(h));b.type!="load"&&(c.navigationStart=c.startTime);d.h.length&&
(d.g=M(d.g),d.g&&Ba(a,b,c,d,e,"",!0));if(e.responseType=="json"){if(!e.response){b.i&&b.i(a,Error("JSON response parsing failed"),e);return}var g=V(D(e.response))}else try{g=oa(e.responseText).m}catch(t){b.i&&b.i(a,t,e);return}if(b.j&&g.length>1)for(d=d.h.length;d<g.length;d++)e=g[d],e.timing||(e.timing={}),e.timing.spfCached=!!c.spfCached,e.timing.spfPrefetched=!!c.spfPrefetched,b.j(a,e);if(g.length>1){var m;A(g,function(t){t.cacheType&&(m=t.cacheType)});g={parts:g,type:"multipart"};m&&(g.cacheType=
m)}else g=g.length==1?g[0]:{};za(a,b,c,g,!0)}`,
    parseOptions,
)
console.log("fnInFn:", JSON.stringify(fnInFn, null, 2), "\n")

const multiVarDecl = parse(`var Ka=n.spf,Z`, parseOptions)
console.log("multiVarDecl:", JSON.stringify(multiVarDecl, null, 2), "\n")
